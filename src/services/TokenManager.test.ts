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

// Wire a mocked AuthService to a backing `session` object. `setAuthSession` MERGES (like the real
// implementation), so after a successful renew `isAccessTokenValid()` reflects the new expiry —
// which the post-store validity check in `performRenewal` depends on.
function wire(auth: any, session: Session) {
  auth.getAuthSession.mockImplementation((el: string) => session[el]);
  auth.setAuthSession.mockImplementation((s: Session) => Object.assign(session, s));
}

// Load a fresh copy of TokenManager (and its mocked deps) so module-level state
// (renewalPromise, isLoggingOut, listeners) is reset for every test.
async function load(session: Session) {
  const tm = await import('./TokenManager');
  const axios = ((await import('axios')) as any).default;
  const auth = (await import('./AuthService')) as any;
  wire(auth, session);
  return { tm, axios, auth };
}

// Load an INDEPENDENT module instance (a second "tab") sharing one backing `session` store and the
// global navigator.locks. Used to exercise real cross-tab serialization.
async function loadTab(session: Session) {
  vi.resetModules();
  const tm = await import('./TokenManager');
  const axios = ((await import('axios')) as any).default;
  const auth = (await import('./AuthService')) as any;
  wire(auth, session);
  return { tm, axios };
}

const future = (ms: number) => new Date(Date.now() + ms).toISOString();
const past = (ms: number) => new Date(Date.now() - ms).toISOString();

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

describe('hasSession', () => {
  it('is true when an access token is present', async () => {
    const { tm } = await load({ access_token: 'a' });
    expect(tm.hasSession()).toBe(true);
  });

  it('is true when only a renewal token is present', async () => {
    const { tm } = await load({ renewal_token: 'r' });
    expect(tm.hasSession()).toBe(true);
  });

  it('is false when neither token is present', async () => {
    const { tm } = await load({});
    expect(tm.hasSession()).toBe(false);
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
      expect.objectContaining({ headers: { authorization: 'renew-1' }, timeout: expect.any(Number) })
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

  it('2xx missing renewal_token → malformed (never stores, so the spent token is not kept)', async () => {
    const { tm, axios, auth } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    // access_token + expiry present but renewal_token omitted — the exact shape that, if stored via
    // the merging setAuthSession, would keep the old (now spent) renewal token.
    axios.post.mockResolvedValueOnce({
      data: { data: { access_token: 'a', token_expiry_time: future(15 * 60 * 1000) } },
    });
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    await expect(tm.getValidAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);
    expect(listener).toHaveBeenCalledWith('refresh_malformed_response');
    expect(auth.setAuthSession).not.toHaveBeenCalled();
  });

  it('2xx but the stored token still reads expired (clock skew) → forced logout, not a renew storm', async () => {
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    // Server issues a token whose expiry is already in the past relative to the (skewed) client clock.
    axios.post.mockResolvedValueOnce(renewResponse({ token_expiry_time: past(1000) }));
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    await expect(tm.getValidAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);
    expect(listener).toHaveBeenCalledWith('refresh_token_still_invalid');
    // exactly one attempt — it does NOT loop/retry into a storm
    expect(axios.post).toHaveBeenCalledTimes(1);
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

  it('a throwing listener does not prevent other listeners from firing', async () => {
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValueOnce(httpError(401));
    const bad = vi.fn(() => {
      throw new Error('listener boom');
    });
    const good = vi.fn();
    tm.onForcedLogout(bad);
    tm.onForcedLogout(good);

    await expect(tm.renewAccessToken()).rejects.toBeInstanceOf(tm.ForcedLogoutError);
    expect(bad).toHaveBeenCalled();
    expect(good).toHaveBeenCalledWith('refresh_unauthorized');
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

  it('403 on renew is transient (retried, no logout) — a proxy/WAF status must not log everyone out', async () => {
    vi.useFakeTimers();
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValue(httpError(403));
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    const p = tm.getValidAccessToken();
    const assertion = expect(p).rejects.toBeInstanceOf(tm.TransientRenewalError);
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;

    expect(axios.post).toHaveBeenCalledTimes(3);
    expect(listener).not.toHaveBeenCalled();
  });

  it('404 on renew is transient (retried, no logout)', async () => {
    vi.useFakeTimers();
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValue(httpError(404));
    const listener = vi.fn();
    tm.onForcedLogout(listener);

    const p = tm.getValidAccessToken();
    const assertion = expect(p).rejects.toBeInstanceOf(tm.TransientRenewalError);
    await vi.advanceTimersByTimeAsync(10_000);
    await assertion;

    expect(axios.post).toHaveBeenCalledTimes(3);
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

  it('backs off between attempts (does not retry instantly)', async () => {
    vi.useFakeTimers();
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockRejectedValue(httpError(500));
    const p = tm.getValidAccessToken();
    p.catch(() => {}); // avoid unhandled rejection while we step timers

    // first attempt fires synchronously
    await Promise.resolve();
    expect(axios.post).toHaveBeenCalledTimes(1);

    // still only 1 before the (>=300ms base) backoff elapses
    await vi.advanceTimersByTimeAsync(50);
    expect(axios.post).toHaveBeenCalledTimes(1);

    // after enough time for the first backoff, the second attempt fires
    await vi.advanceTimersByTimeAsync(700);
    expect(axios.post).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(5_000);
    await expect(p).rejects.toBeInstanceOf(tm.TransientRenewalError);
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
  // Web Locks stand-in that faithfully SERIALIZES callbacks per lock name: callback N+1 does not
  // start until callback N's returned promise settles, exactly like the real API. Accepts both the
  // 2-arg request(name, cb) and 3-arg request(name, options, cb) signatures.
  const installLocks = () => {
    const queues = new Map<string, Promise<any>>();
    const request = vi.fn(async (name: string, optsOrCb: any, maybeCb?: any) => {
      const cb = typeof optsOrCb === 'function' ? optsOrCb : maybeCb;
      const previous = queues.get(name) ?? Promise.resolve();
      const run = previous.then(cb, cb);
      // keep the chain alive even if a callback rejects, so the next waiter still runs
      queues.set(
        name,
        run.catch(() => {})
      );
      return run;
    });
    (navigator as any).locks = { request };
    return request;
  };

  afterEach(() => {
    delete (navigator as any).locks;
  });

  it('acquires the cross-tab lock (by name) before renewing', async () => {
    const request = installLocks();
    const { tm, axios } = await load({ token_expiry_time: future(1000), renewal_token: 'renew-1' });
    axios.post.mockResolvedValueOnce(renewResponse());

    await expect(tm.renewAccessToken()).resolves.toBe('new-access');
    expect(request).toHaveBeenCalledWith('glific-token-renewal', expect.anything(), expect.any(Function));
  });

  it('TWO concurrent tabs → exactly ONE /renew; the loser adopts the winner’s token (real serialization)', async () => {
    installLocks(); // one shared lock for both tabs

    // one shared session store, starting expired so both tabs attempt renewal
    const store: Session = {
      token_expiry_time: past(1000),
      renewal_token: 'renew-1',
      access_token: 'old-access',
    };

    const tabA = await loadTab(store);
    const tabB = await loadTab(store); // independent module instance; tabA ref remains valid

    // The two tabs have separate TokenManager module state (separate single-flight guards) but the
    // auto-mocked axios is one shared singleton — which is exactly what we want to count: the number
    // of /renew calls made by BOTH tabs combined.
    const post = tabA.axios.post;
    post.mockReset();
    // Any 2nd network call (a loser presenting the already-spent 'renew-1') would come back 401. If
    // the lock failed to serialize, this is what the loser would hit — and the test would fail.
    post.mockRejectedValue(httpError(401));
    // The winner (first to acquire the lock) renews successfully and writes a fresh, valid session.
    post.mockResolvedValueOnce(
      renewResponse({
        access_token: 'winner-access',
        renewal_token: 'renew-2',
        token_expiry_time: future(15 * 60 * 1000),
      })
    );
    const loserLogout = vi.fn();
    tabB.tm.onForcedLogout(loserLogout);

    const [resA, resB] = await Promise.all([tabA.tm.renewAccessToken(), tabB.tm.renewAccessToken()]);

    // Exactly ONE /renew for two concurrent tabs — the loser adopted the winner's token instead of
    // spending the single-use renewal token a second time.
    expect(post).toHaveBeenCalledTimes(1);
    expect(resA).toBe('winner-access');
    expect(resB).toBe('winner-access');
    expect(loserLogout).not.toHaveBeenCalled();
  });

  it('still renews when the session is unchanged after acquiring the lock', async () => {
    installLocks();
    const { tm, axios } = await load({
      token_expiry_time: past(1000),
      renewal_token: 'renew-1',
      access_token: 'stale-access',
    });
    axios.post.mockResolvedValueOnce(renewResponse());

    await expect(tm.renewAccessToken()).resolves.toBe('new-access');
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('renews unlocked (degraded) when acquiring the lock times out', async () => {
    const request = vi.fn(async () => {
      const err: any = new Error('The lock request was aborted');
      err.name = 'AbortError';
      throw err;
    });
    (navigator as any).locks = { request };

    const { tm, axios } = await load({ token_expiry_time: past(1000), renewal_token: 'renew-1' });
    axios.post.mockResolvedValueOnce(renewResponse());

    await expect(tm.renewAccessToken()).resolves.toBe('new-access');
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('falls back to unlocked renewal when the Web Locks API is unavailable', async () => {
    delete (navigator as any).locks;
    const { tm, axios } = await load({ token_expiry_time: past(1000), renewal_token: 'renew-1' });
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
