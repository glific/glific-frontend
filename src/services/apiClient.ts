import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { getValidAccessToken, hasSession } from 'services/TokenManager';

// Bound every REST call so a dead-but-open socket can't leave a request (and its caller) pending
// forever. Renewal has its own tighter timeout inside TokenManager.
const REQUEST_TIMEOUT_MS = 30 * 1000;

/**
 * apiClient
 *
 * The single authenticated axios instance for every non-GraphQL API call. Two interceptors
 * make auth transparent to callers, so features never read/inject tokens themselves:
 *
 *   - request:  proactively injects a *valid* access token (renewing via TokenManager if the
 *               current one is expired / within the 30s buffer).
 *   - response: on a 401, renews once and replays the request a single time.
 *
 * Renewal/logout policy lives entirely in TokenManager (see its error matrix). A terminal
 * failure surfaces as ForcedLogoutError (logout already emitted); a transient one as
 * TransientRenewalError (no logout). Both simply reject the caller here.
 *
 * Opt out per-request with `meta: { skipAuth: true }` — the interceptors then neither inject a
 * token nor attempt a renew/retry (used for best-effort calls during logout, where renewing a
 * token only to delete the session would be wrong).
 */

// Augment axios config with our custom fields (declaration merging).
declare module 'axios' {
  export interface AxiosRequestConfig {
    meta?: { skipAuth?: boolean; isRenew?: boolean };
    _retry?: boolean;
  }
}

export const apiClient = axios.create({ timeout: REQUEST_TIMEOUT_MS });

const registerInterceptors = (client: typeof apiClient) => {
  // Request: inject a guaranteed-valid access token (proactive renewal happens inside TokenManager).
  client.interceptors.request.use(async (config) => {
    // Skip when opted out, or when there is no session at all — mirrors the Apollo authLink guard so
    // a call made while logged out can't drive a renewal (and thus a spurious forced logout).
    if (config.meta?.skipAuth || !hasSession()) {
      return config;
    }

    // May throw ForcedLogoutError / TransientRenewalError — propagates to the caller as a rejection.
    const token = await getValidAccessToken();
    config.headers.Authorization = token;
    return config;
  });

  // Response: on 401, renew once and replay the original request a single time.
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
      const status = error.response?.status;

      const shouldAttemptRenewal = status === 401 && !!config && !config._retry && !config.meta?.skipAuth;

      if (!shouldAttemptRenewal) {
        return Promise.reject(error);
      }

      // Guard against loops: this request gets exactly one renew-and-retry.
      config!._retry = true;

      // getValidAccessToken (not renewAccessToken): if another caller already replaced the token
      // while this 401 was in flight, adopt it without spending the single-use renewal token again.
      // Any ForcedLogoutError / TransientRenewalError simply rejects the caller (logout, if needed,
      // was already emitted by TokenManager).
      const token = await getValidAccessToken();
      config!.headers.Authorization = token;
      return client(config!);
    }
  );
};

// Guard: test files that replace the whole `axios` module via `vi.mock('axios')` make
// `axios.create()` return undefined. Skipping registration keeps *importing* this module safe;
// such tests mock `services/apiClient` directly when they actually exercise it. In production
// `axios.create()` always returns a real instance, so interceptors are always registered.
if (apiClient) {
  registerInterceptors(apiClient);
}

export default apiClient;
