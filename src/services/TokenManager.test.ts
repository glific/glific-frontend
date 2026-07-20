import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Keep config light: TokenManager only needs the renew URL.
vi.mock('config', () => ({ RENEW_TOKEN: 'https://test.glific/api/v1/session/renew' }));
vi.mock('axios');
// AuthService is the session store; mock its read/write so we control token state.
vi.mock('./AuthService', () => ({
  getAuthSession: vi.fn(),
  setAuthSession: vi.fn(),
}));

type Session = Record<string, any>;

// Load a fresh copy of TokenManager (and its mocked deps) so module-level state
// (renewalPromise, isLoggingOut, listeners) is reset for every test.
async function load(session: Session) {
  const tm = await import('./TokenManager');
  const axios = ((await import('axios')) as any).default;
  const auth = (await import('./AuthService')) as any;
  auth.getAuthSession.mockImplementation((el: string) => session[el]);
  return { tm, axios, auth };
}

const future = (ms: number) => new Date(Date.now() + ms).toISOString();

const renewResponse = (overrides: Partial<Session> = {}) => ({
  data: {
    data: {
      access_token: 'new-access',
      renewal_token: 'new-renewal',
      token_expiry_time: future(15 * 60 * 1000),
      ...overrides,
    },
  },
});

const httpError = (status: number) => ({ response: { status }, message: `HTTP ${status}` });
const networkError = () => ({ message: 'Network Error' }); // no `response`

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('isAccessTokenValid', () => {
  it('is true when the token expires well beyond the 30s buffer', async () => {
    const { tm } = await load({ token_expiry_time: future(5 * 60 * 1000) });
    expect(tm.isAccessTokenValid()).toBe(true);
  });

  it('is false when the token expires within the 30s buffer', async () => {
    const { tm } = await load({ token_expiry_time: future(10 * 1000) });
    expect(tm.isAccessTokenValid()).toBe(false);
  });

  it('is false when there is no expiry (no session)', async () => {
    const { tm } = await load({});
    expect(tm.isAccessTokenValid()).toBe(false);
  });
});

describe('getValidAccessToken', () => {
  it('returns the stored token without any network call when still valid', async () => {
    const { tm, axios } = await load({
      token_expiry_time: future(5 * 60 * 1000),
      access_token: 'current-access',
    });

    await expect(tm.getValidAccessToken()).resolves.toBe('current-access');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('renews and returns the new token when expired', async () => {
    const { tm, axios, auth } = await load({
      token_expiry_time: future(5 * 1000),
      renewal_token: 'renew-1',
    });
    axios.post.mockResolvedValueOnce(renewResponse());

    await expect(tm.getValidAccessToken()).resolves.toBe('new-access');
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(
      'https://test.glific/api/v1/session/renew',
      null,
      expect.objectContaining({ headers: { authorization: 'renew-1' } })
    );
    expect(auth.setAuthSession).toHaveBeenCalledWith(expect.objectContaining({ access_token: 'new-access' }));
  });

  it('is single-flight: concurrent callers share ONE renewal', async () => {
    const { tm, axios } = await load({ token_expiry_time: future(5 * 1000), renewal_token: 'renew-1' });
    axios.post.mockResolvedValueOnce(renewResponse());

    const [a, b, c] = await Promise.all([tm.getValidAccessToken(), tm.getValidAccessToken(), tm.getValidAccessToken()]);

    expect([a, b, c]).toEqual(['new-access', 'new-access', 'new-access']);
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});

describe('renewal error policy — terminal (forced logout)', () => {
  it('401 → ForcedLogoutError and fires onForcedLogout once', async () => {
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValueOnce(httpError(401));
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    await expect(tm.getValidAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('refresh_unauthorized');
  });

  it('400 → ForcedLogoutError and fires onForcedLogout', async () => {
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValueOnce(httpError(400));
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    await expect(tm.getValidAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);
    expect(listener).toHaveBeenCalledWith('refresh_bad_request');
  });

  it('missing renewal token → ForcedLogoutError without any network call', async () => {
    const { tm, axios } = await load({ token_expiry_time: future(1000) }); // no renewal_token
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    await expect(tm.getValidAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);
    expect(axios.post).not.toHaveBeenCalled();
    expect(listener).toHaveBeenCalledWith('missing_renewal_token');
  });

  it('2xx without tokens → ForcedLogoutError (malformed contract)', async () => {
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockResolvedValueOnce({ data: {} });
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    await expect(tm.getValidAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);
    expect(listener).toHaveBeenCalledWith('refresh_malformed_response');
  });

  it('isLoggingOut guard: repeated 401s emit forced logout only once', async () => {
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValue(httpError(401));
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    await expect(tm.renewAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);
    await expect(tm.renewAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('renewal error policy — transient (retry, no logout)', () => {
  it('500 retries up to the cap then throws TransientRenewalError without logout', async () => {
    vi.useFakeTimers();
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValue(httpError(500));
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    const p = tm.getValidAccessToken();
    const assertion = expect(p).rejects.toBeInstanceOf(tm.TransientRenewalError);
    // flush all backoff timers + interleaved microtasks
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;

    expect(axios.post).toHaveBeenCalledTimes(3); // MAX_RENEWAL_ATTEMPTS
    expect(listener).not.toHaveBeenCalled();
  });

  it('network error is transient (retried), not a logout', async () => {
    vi.useFakeTimers();
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValue(networkError());
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    const p = tm.getValidAccessToken();
    const assertion = expect(p).rejects.toBeInstanceOf(tm.TransientRenewalError);
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;

    expect(axios.post).toHaveBeenCalledTimes(3);
    expect(listener).not.toHaveBeenCalled();
  });

  it('recovers if a retry eventually succeeds (429 then 200)', async () => {
    vi.useFakeTimers();
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValueOnce(httpError(429)).mockResolvedValueOnce(renewResponse());

    const p = tm.getValidAccessToken();
    await vi.advanceTimersByTimeAsync(10_000);

    await expect(p).resolves.toBe('new-access');
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});

describe('cross-tab renewal lock', () => {
  // Minimal Web Locks stand-in: serialises callbacks per lock name, like the real API.
  const installLocks = () => {
    const queues = new Map<string, Promise<any>>();
    const request = vi.fn(async (name: string, cb: () => Promise<any>) => {
      const previous = queues.get(name) ?? Promise.resolve();
      const next = previous.then(cb, cb);
      queues.set(
        name,
        next.catch(() => {})
      );
      return next;
    });
    (navigator as any).locks = { request };
    return request;
  };

  afterEach(() => {
    delete (navigator as any).locks;
  });

  it('acquires the cross-tab lock before renewing', async () => {
    const request = installLocks();
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockResolvedValueOnce(renewResponse());

    await expect(tm.renewAccessToken()).resolves.toBe('new-access');
    expect(request).toHaveBeenCalledWith('glific-token-renewal', expect.any(Function));
  });

  it("adopts the winning tab's session instead of spending an already-rotated renewal token", async () => {
    const request = installLocks();
    const session: Session = {
      token_expiry_time: future(1000),
      renewal_token: 'renew-1',
      access_token: 'stale-access',
    };
    const { tm, axios } = await load(session);

    // Simulate the other tab winning the lock: while we are queued it writes a fresh session to
    // localStorage and burns `renew-1` server-side. Any /renew we send would come back 401.
    request.mockImplementationOnce(async (_name: string, cb: () => Promise<any>) => {
      session.access_token = 'other-tab-access';
      session.renewal_token = 'renew-2';
      session.token_expiry_time = future(15 * 60 * 1000);
      return cb();
    });
    axios.post.mockRejectedValue(httpError(401));
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    await expect(tm.renewAccessToken()).resolves.toBe('other-tab-access');
    expect(axios.post).not.toHaveBeenCalled();
    expect(listener).not.toHaveBeenCalled();
  });

  it('still renews when the session is unchanged after acquiring the lock', async () => {
    installLocks();
    const { tm, axios } = await load({
      token_expiry_time: future(1000),
      renewal_token: 'renew-1',
      access_token: 'stale-access',
    });
    axios.post.mockResolvedValueOnce(renewResponse());

    await expect(tm.renewAccessToken()).resolves.toBe('new-access');
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('falls back to unlocked renewal when the Web Locks API is unavailable', async () => {
    delete (navigator as any).locks;
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockResolvedValueOnce(renewResponse());

    await expect(tm.renewAccessToken()).resolves.toBe('new-access');
    expect(axios.post).toHaveBeenCalledTimes(1);
  });
});

describe('onForcedLogout', () => {
  it('unsubscribe stops further notifications', async () => {
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValue(httpError(401));
    const listener = vi.fn();
    const unsubscribe = tm.onForcedLogout(listener);
    unsubscribe();

    await expect(tm.renewAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);
    expect(listener).not.toHaveBeenCalled();
  });
});
