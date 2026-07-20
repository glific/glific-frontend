import axios from 'axios';

import { RENEW_TOKEN } from 'config';
import setLogs from 'config/logs';
import { getAuthSession, setAuthSession } from './AuthService';

/**
 * TokenManager
 *
 * Central authority for access-token validity and renewal. It is the single place that
 * talks to the `/session/renew` endpoint, so every caller (the axios apiClient interceptor,
 * the Apollo links and the flow-editor shim) shares one renewal path, one single-flight
 * guard and one error policy.
 *
 * Error policy (locked):
 *   - 200                                    -> store tokens, resolve access token
 *   - 400 / 401 (and other terminal 4xx)     -> emit forced logout, throw ForcedLogoutError
 *   - 429 / 5xx / network / timeout          -> retry with backoff; if still failing throw
 *                                               TransientRenewalError (NO logout)
 *
 * This module intentionally knows nothing about react-router / navigation. Forced logout is
 * surfaced through `onForcedLogout` subscribers so the routing layer stays decoupled.
 *
 * Multi-tab safety: the backend rotates the renewal token (it is single-use — see
 * `APIAuthPlug.renew/2`, which deletes the presented token before issuing a new pair). Two tabs
 * renewing at the same instant would therefore both present the same token, and the loser would
 * get a 401 and be logged out even though the session is alive. Renewal is serialised across
 * tabs with the Web Locks API, and the tab that waited re-reads the session before renewing, so
 * it simply adopts the winner's freshly stored token instead of spending it a second time.
 */

/** Renewal failed terminally (400/401) — the session is unrecoverable and the user must re-login. */
export class ForcedLogoutError extends Error {
  reason: string;

  constructor(reason: string) {
    super(`Forced logout required: ${reason}`);
    this.name = 'ForcedLogoutError';
    this.reason = reason;
  }
}

/** Renewal failed after retries due to a transient condition (429/5xx/network) — do NOT log out. */
export class TransientRenewalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransientRenewalError';
  }
}

// 30-second buffer: a token expiring within this window is treated as invalid so we renew
// proactively before it actually lapses mid-request (ported from the old checkAuthStatusService).
const TOKEN_EXPIRY_BUFFER_MS = 30 * 1000;

// Transient-retry tuning: up to MAX_RENEWAL_ATTEMPTS total tries with capped exponential backoff.
const MAX_RENEWAL_ATTEMPTS = 3;
const RENEWAL_BACKOFF_BASE_MS = 300;

// HTTP statuses on the renew call that should be retried rather than logging the user out.
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

// ---------------------------------------------------------------------------
// Forced-logout emitter (decoupled from routing)
// ---------------------------------------------------------------------------

type ForcedLogoutListener = (reason: string) => void;

const forcedLogoutListeners = new Set<ForcedLogoutListener>();

// Guards against repeat 401s each firing their own logout. Once a forced logout has been
// emitted the session is considered gone, so further emits are suppressed.
let isLoggingOut = false;

/**
 * Subscribe to forced-logout events. Returns an unsubscribe function.
 */
export const onForcedLogout = (cb: ForcedLogoutListener): (() => void) => {
  forcedLogoutListeners.add(cb);
  return () => {
    forcedLogoutListeners.delete(cb);
  };
};

const emitForcedLogout = (reason: string): void => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  setLogs(`TokenManager: forced logout (${reason})`, 'error');
  forcedLogoutListeners.forEach((listener) => {
    try {
      listener(reason);
    } catch (err) {
      // a broken listener must not stop the others from running
      setLogs(`TokenManager: forced-logout listener threw - ${err}`, 'error');
    }
  });
};

// ---------------------------------------------------------------------------
// Token validity
// ---------------------------------------------------------------------------

/**
 * True if the stored access token is present and valid past the 30s buffer. Pure read of
 * localStorage — no network.
 */
export const isAccessTokenValid = (): boolean => {
  const tokenExpiryTime = getAuthSession('token_expiry_time');
  if (!tokenExpiryTime) return false;

  const expiresAt = new Date(tokenExpiryTime).getTime();
  const now = new Date().getTime();
  return expiresAt - now > TOKEN_EXPIRY_BUFFER_MS;
};

// ---------------------------------------------------------------------------
// Renewal (single-flight + retry + error policy)
// ---------------------------------------------------------------------------

let renewalPromise: Promise<string> | null = null;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const backoffDelay = (attempt: number): number => {
  // attempt is 1-based; exponential with jitter, capped implicitly by MAX_RENEWAL_ATTEMPTS.
  const exponential = RENEWAL_BACKOFF_BASE_MS * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * RENEWAL_BACKOFF_BASE_MS);
  return exponential + jitter;
};

/**
 * Classify a renew failure. Returns the error to throw. For terminal failures it also emits
 * the forced-logout event as a side effect.
 */
const classifyRenewalFailure = (error: any): ForcedLogoutError | TransientRenewalError => {
  const status: number | undefined = error?.response?.status;

  // No HTTP response => network error / timeout => transient.
  if (status === undefined) {
    return new TransientRenewalError(`Renewal network error: ${error?.message ?? 'unknown'}`);
  }

  if (TRANSIENT_STATUSES.has(status)) {
    return new TransientRenewalError(`Renewal transient failure (HTTP ${status})`);
  }

  // 400/401 and any other terminal client rejection => the refresh token is unusable.
  const reason = status === 401 ? 'refresh_unauthorized' : status === 400 ? 'refresh_bad_request' : `refresh_${status}`;
  emitForcedLogout(reason);
  return new ForcedLogoutError(reason);
};

/**
 * Perform the actual renewal, including transient-retry with backoff. Resolves with the new
 * access token, or throws ForcedLogoutError / TransientRenewalError per the error policy.
 */
const performRenewal = async (): Promise<string> => {
  const renewalToken = getAuthSession('renewal_token');
  if (!renewalToken) {
    // Nothing to renew with — unrecoverable.
    emitForcedLogout('missing_renewal_token');
    throw new ForcedLogoutError('missing_renewal_token');
  }

  let lastTransient: TransientRenewalError | null = null;

  for (let attempt = 1; attempt <= MAX_RENEWAL_ATTEMPTS; attempt += 1) {
    try {
      const response = await axios.post(RENEW_TOKEN, null, {
        headers: { authorization: renewalToken },
        // marker so this request is identifiable; it never routes through apiClient anyway.
        meta: { isRenew: true },
      } as any);

      const tokens = response?.data?.data;
      if (!tokens || !tokens.access_token) {
        // A 2xx without tokens is a malformed contract — treat as terminal.
        emitForcedLogout('refresh_malformed_response');
        throw new ForcedLogoutError('refresh_malformed_response');
      }

      setAuthSession(tokens);
      setLogs('TokenManager: renewal succeeded, session updated', 'info');
      return tokens.access_token as string;
    } catch (error: any) {
      // Our own thrown ForcedLogoutError (e.g. malformed response) must propagate unchanged.
      if (error instanceof ForcedLogoutError) throw error;

      const classified = classifyRenewalFailure(error);
      if (classified instanceof ForcedLogoutError) throw classified;

      // Transient: back off and retry (unless this was the last attempt).
      lastTransient = classified;
      setLogs(`TokenManager: ${classified.message} (attempt ${attempt}/${MAX_RENEWAL_ATTEMPTS})`, 'error');
      if (attempt < MAX_RENEWAL_ATTEMPTS) {
        await sleep(backoffDelay(attempt));
      }
    }
  }

  throw lastTransient ?? new TransientRenewalError('Renewal failed after retries');
};

// Name of the cross-tab Web Lock. All tabs of this origin contend for it, so at most one
// `/renew` is ever in flight for a given session.
const RENEWAL_LOCK_NAME = 'glific-token-renewal';

/**
 * Run `fn` while holding the cross-tab renewal lock. Falls back to running unlocked where the
 * Web Locks API is unavailable (non-secure contexts, jsdom in tests) — behaviour then degrades
 * to the per-tab single-flight guard, which is what we had before.
 */
const withRenewalLock = <T>(fn: () => Promise<T>): Promise<T> => {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (!locks?.request) return fn();
  return locks.request(RENEWAL_LOCK_NAME, fn) as Promise<T>;
};

/**
 * Force a renewal now (used by the reactive 401 retry paths). Single-flight within this tab, and
 * serialised across tabs via the Web Locks API. Resolves with the new access token.
 */
export const renewAccessToken = (): Promise<string> => {
  if (renewalPromise) {
    setLogs('TokenManager: joining in-flight renewal', 'info');
    return renewalPromise;
  }

  setLogs('TokenManager: starting renewal', 'info');

  // Snapshot the token we are about to replace, so that after waiting for the lock we can tell
  // whether another tab renewed in the meantime.
  const accessTokenBeforeLock = getAuthSession('access_token');

  renewalPromise = withRenewalLock(async () => {
    const currentAccessToken = getAuthSession('access_token');
    if (currentAccessToken && currentAccessToken !== accessTokenBeforeLock && isAccessTokenValid()) {
      // Another tab renewed while we queued for the lock. Its renewal token has already been
      // spent; presenting ours would 401 and log this tab out for no reason.
      setLogs('TokenManager: another tab renewed while we waited for the lock, adopting its session', 'info');
      return currentAccessToken as string;
    }
    return performRenewal();
  }).finally(() => {
    renewalPromise = null;
  });

  return renewalPromise;
};

/**
 * Returns a valid access token, proactively renewing (single-flight) if the current one is
 * missing / expired / within the buffer. Throws ForcedLogoutError or TransientRenewalError
 * per the error policy.
 */
export const getValidAccessToken = async (): Promise<string> => {
  if (isAccessTokenValid()) {
    return getAuthSession('access_token');
  }
  return renewAccessToken();
};
