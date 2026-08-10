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
 *   - 200 with a full token triplet          -> store tokens, resolve access token
 *   - 400 / 401 ONLY                          -> emit forced logout, throw ForcedLogoutError
 *   - everything else (network/timeout, 429,  -> retry with backoff; if still failing throw
 *     5xx, and any other status e.g. 403/404)    TransientRenewalError (NO logout)
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

// Per-attempt network timeout on the /renew call. Without this the request (and, because renewal
// runs inside the cross-tab Web Lock, every tab awaiting a token) could hang forever on a dead-but-
// open socket (captive portal, suspend/resume onto a new network).
const RENEW_REQUEST_TIMEOUT_MS = 10 * 1000;

// Upper bound on how long a tab waits to *acquire* the cross-tab lock before giving up and renewing
// unlocked. Backstops the (already timeout-bounded) case where the lock holder wedges.
const LOCK_ACQUIRE_TIMEOUT_MS = 45 * 1000;

// Only these renew statuses are terminal (session unrecoverable -> forced logout). EVERYTHING else
// — network/timeout, 429, 5xx, and also 403/404/etc. from a proxy/WAF/misroute — is transient and
// retried, so a transient edge (e.g. a Cloudflare 403 on /renew) never logs out every active user.
const TERMINAL_STATUSES = new Set([400, 401]);

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

/**
 * True if there is any stored session to authenticate/renew with. Callers gate token injection on
 * this so an operation issued while logged out (pre-login, or after logout) never triggers a
 * renewal — and therefore never a spurious forced logout.
 */
export const hasSession = (): boolean => Boolean(getAuthSession('access_token') || getAuthSession('renewal_token'));

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

  // Terminal ONLY on 400/401 — the backend positively rejected the refresh token, so the session
  // is unrecoverable and we log out.
  if (status !== undefined && TERMINAL_STATUSES.has(status)) {
    const reason = status === 401 ? 'refresh_unauthorized' : 'refresh_bad_request';
    emitForcedLogout(reason);
    return new ForcedLogoutError(reason);
  }

  // Everything else is transient: no HTTP response (network/timeout), 429, 5xx, and any other
  // status (403/404/...) that could come from a proxy/WAF/misroute rather than the auth backend.
  const message =
    status === undefined
      ? `Renewal network error: ${error?.message ?? 'unknown'}`
      : `Renewal transient failure (HTTP ${status})`;
  return new TransientRenewalError(message);
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
        timeout: RENEW_REQUEST_TIMEOUT_MS,
        // marker so this request is identifiable; it never routes through apiClient anyway.
        meta: { isRenew: true },
      } as any);

      const tokens = response?.data?.data;
      // `setAuthSession` MERGES into the stored session, so a response missing any field would
      // silently keep the OLD value. In particular a missing renewal_token would leave the spent
      // token in place -> the next renewal 401s -> a live session is logged out. Require the full
      // triplet before storing so a malformed 2xx is caught here instead.
      if (!tokens || !tokens.access_token || !tokens.renewal_token || !tokens.token_expiry_time) {
        emitForcedLogout('refresh_malformed_response');
        throw new ForcedLogoutError('refresh_malformed_response');
      }

      setAuthSession(tokens);

      // The renew succeeded but the stored token still reads as expired: the client clock is skewed
      // far enough that `isAccessTokenValid()` will never be satisfied, so every subsequent request
      // would renew again — a storm that burns the single-use renewal token and rate-limits the
      // backend while the session is actually fine. Fail terminally instead of looping.
      if (!isAccessTokenValid()) {
        emitForcedLogout('refresh_token_still_invalid');
        throw new ForcedLogoutError('refresh_token_still_invalid');
      }

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
const withRenewalLock = async <T>(fn: () => Promise<T>): Promise<T> => {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (!locks?.request) return fn();

  // Bound the wait to ACQUIRE the lock. The holder's work is already timeout-bounded (the /renew
  // call has RENEW_REQUEST_TIMEOUT_MS), but if a holder tab wedges anyway, a waiter must not hang
  // forever — every request in every tab awaits a token. On timeout we renew unlocked (degraded to
  // per-tab single-flight, same as the no-locks fallback) rather than stalling.
  const signal =
    typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
      ? AbortSignal.timeout(LOCK_ACQUIRE_TIMEOUT_MS)
      : undefined;
  const options = signal ? { signal } : {};

  try {
    return (await locks.request(RENEWAL_LOCK_NAME, options, fn)) as T;
  } catch (err: any) {
    if (err?.name === 'AbortError' || err?.name === 'TimeoutError') {
      setLogs('TokenManager: timed out acquiring renewal lock, renewing unlocked', 'error');
      return fn();
    }
    throw err;
  }
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
