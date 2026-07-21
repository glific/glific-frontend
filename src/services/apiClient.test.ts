import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { apiClient } from './apiClient';
import { ForcedLogoutError, TransientRenewalError } from './TokenManager';

vi.mock('./TokenManager', async () => {
  const actual = await vi.importActual<typeof import('./TokenManager')>('./TokenManager');
  return {
    ...actual,
    getValidAccessToken: vi.fn(),
    // hasSession gates the request interceptor; default to "logged in" and override per test.
    hasSession: vi.fn(() => true),
  };
});

// Import the mocked fns after vi.mock so we get the mock references.
import { getValidAccessToken, hasSession } from './TokenManager';

const mockedGetValidAccessToken = vi.mocked(getValidAccessToken);
const mockedHasSession = vi.mocked(hasSession);

// A controllable axios adapter so tests never touch the network. Each element of the queue
// either resolves a 200 or rejects an AxiosError; the adapter shifts through them per request.
let adapter: ReturnType<typeof vi.fn>;

const okResponse = (config: InternalAxiosRequestConfig) => ({
  data: { ok: true },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

const axiosErrorWithStatus = (config: InternalAxiosRequestConfig, status: number) =>
  new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, null, {
    data: {},
    status,
    statusText: '',
    headers: {},
    config,
  } as any);

beforeEach(() => {
  vi.clearAllMocks();
  mockedHasSession.mockReturnValue(true);
  adapter = vi.fn();
  apiClient.defaults.adapter = adapter as any;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('apiClient request interceptor', () => {
  it('injects a valid access token from TokenManager', async () => {
    mockedGetValidAccessToken.mockResolvedValue('valid-token');
    adapter.mockImplementation((config: InternalAxiosRequestConfig) => Promise.resolve(okResponse(config)));

    await apiClient.get('/anything');

    expect(mockedGetValidAccessToken).toHaveBeenCalledTimes(1);
    const sentConfig = adapter.mock.calls[0][0] as InternalAxiosRequestConfig;
    expect(sentConfig.headers.Authorization).toBe('valid-token');
  });

  it('skips auth when meta.skipAuth is set (no token fetch, header untouched)', async () => {
    adapter.mockImplementation((config: InternalAxiosRequestConfig) => Promise.resolve(okResponse(config)));

    await apiClient.get('/public', {
      meta: { skipAuth: true },
      headers: new AxiosHeaders({ authorization: 'manual-token' }),
    });

    expect(mockedGetValidAccessToken).not.toHaveBeenCalled();
    const sentConfig = adapter.mock.calls[0][0] as InternalAxiosRequestConfig;
    expect(sentConfig.headers.authorization).toBe('manual-token');
  });

  it('skips auth when there is no session (does not drive a renewal while logged out)', async () => {
    mockedHasSession.mockReturnValue(false);
    adapter.mockImplementation((config: InternalAxiosRequestConfig) => Promise.resolve(okResponse(config)));

    await apiClient.get('/anything');

    expect(mockedGetValidAccessToken).not.toHaveBeenCalled();
    const sentConfig = adapter.mock.calls[0][0] as InternalAxiosRequestConfig;
    expect(sentConfig.headers.Authorization).toBeUndefined();
  });

  it('rejects (without sending) when proactive renewal forces logout', async () => {
    mockedGetValidAccessToken.mockRejectedValue(new ForcedLogoutError('refresh_unauthorized'));

    await expect(apiClient.get('/anything')).rejects.toBeInstanceOf(ForcedLogoutError);
    expect(adapter).not.toHaveBeenCalled();
  });
});

describe('apiClient response interceptor (401 handling)', () => {
  it('renews once and replays the request on 401, then succeeds', async () => {
    mockedGetValidAccessToken.mockResolvedValue('token');
    adapter
      .mockImplementationOnce((config: InternalAxiosRequestConfig) => Promise.reject(axiosErrorWithStatus(config, 401)))
      .mockImplementationOnce((config: InternalAxiosRequestConfig) => Promise.resolve(okResponse(config)));

    const response = await apiClient.get('/protected');

    // original request + exactly one replay
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
  });

  it('does not retry more than once (no infinite loop) if the replay also 401s', async () => {
    mockedGetValidAccessToken.mockResolvedValue('token');
    adapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      Promise.reject(axiosErrorWithStatus(config, 401))
    );

    await expect(apiClient.get('/protected')).rejects.toBeInstanceOf(AxiosError);
    // 1 original + 1 replay only.
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('does NOT renew-and-retry a skipAuth request that 401s (used by logout)', async () => {
    adapter.mockImplementationOnce((config: InternalAxiosRequestConfig) =>
      Promise.reject(axiosErrorWithStatus(config, 401))
    );

    await expect(
      apiClient.delete('/session', {
        meta: { skipAuth: true },
        headers: new AxiosHeaders({ authorization: 'dying-token' }),
      })
    ).rejects.toBeInstanceOf(AxiosError);

    // no renewal, no replay — exactly one call
    expect(mockedGetValidAccessToken).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('rejects with ForcedLogoutError when the renewal on a 401 forces logout', async () => {
    // request interceptor succeeds, then the replay-path renewal forces logout
    mockedGetValidAccessToken
      .mockResolvedValueOnce('token')
      .mockRejectedValueOnce(new ForcedLogoutError('refresh_unauthorized'));
    adapter.mockImplementationOnce((config: InternalAxiosRequestConfig) =>
      Promise.reject(axiosErrorWithStatus(config, 401))
    );

    await expect(apiClient.get('/protected')).rejects.toBeInstanceOf(ForcedLogoutError);
    // no successful replay
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('rejects with TransientRenewalError when the renewal on a 401 is transient', async () => {
    mockedGetValidAccessToken
      .mockResolvedValueOnce('token')
      .mockRejectedValueOnce(new TransientRenewalError('Renewal transient failure (HTTP 500)'));
    adapter.mockImplementationOnce((config: InternalAxiosRequestConfig) =>
      Promise.reject(axiosErrorWithStatus(config, 401))
    );

    await expect(apiClient.get('/protected')).rejects.toBeInstanceOf(TransientRenewalError);
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('passes non-401 errors through without renewing', async () => {
    mockedGetValidAccessToken.mockResolvedValue('token');
    adapter.mockImplementation((config: InternalAxiosRequestConfig) =>
      Promise.reject(axiosErrorWithStatus(config, 500))
    );

    await expect(apiClient.get('/protected')).rejects.toBeInstanceOf(AxiosError);
    // one call for the request itself; getValidAccessToken only from the request interceptor
    expect(adapter).toHaveBeenCalledTimes(1);
    expect(mockedGetValidAccessToken).toHaveBeenCalledTimes(1);
  });
});
