import { FLOW_EDITOR_API } from 'config';
import setLogs from 'config/logs';
import { getValidAccessToken } from 'services/TokenManager';

/**
 * flowEditorAuthShim
 *
 * The embedded `@glific/flow-editor` library fires its own `fetch` / `XMLHttpRequest`
 * calls to the flow-editor endpoints (see `FlowEditor.helper.tsx`) and exposes no auth
 * hook, so we cannot route those requests through our axios `apiClient`. This shim is the
 * one legitimate place we patch the global `fetch`/`XHR` — but, unlike the old
 * `setAuthHeaders()` monkey-patch, it is:
 *
 *   1. Installed only while the flow editor is mounted (see `FlowEditor.tsx`).
 *   2. Scoped: it ONLY touches requests whose URL starts with `FLOW_EDITOR_API`; every
 *      other request runs through the untouched native implementation.
 *   3. Backed by `TokenManager`, so token renewal + the forced-logout / transient error
 *      policy are shared with the rest of the app. It never navigates on its own — a
 *      `ForcedLogoutError` is handled by TokenManager's subscribers, not here (the old
 *      blunt `window.location.href = '/logout/user'` on any 401 is intentionally gone).
 */

const isFlowEditorUrl = (url: string | null | undefined): boolean =>
  typeof url === 'string' && url.startsWith(FLOW_EDITOR_API);

const resolveUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  return input.url;
};

/**
 * Ask TokenManager for a valid token, renewing if needed. Swallows errors: a
 * `ForcedLogoutError` has already emitted the forced-logout event (routing handled
 * elsewhere) and a `TransientRenewalError` means we let the request go out and fail
 * naturally so the flow-editor library surfaces its own error. Either way the shim
 * never throws out of `fetch`/`send`.
 */
const acquireTokenSafely = async (): Promise<string | null> => {
  try {
    return await getValidAccessToken();
  } catch (err) {
    setLogs(`flowEditorAuthShim: token unavailable, sending without refresh - ${err}`, 'error');
    return null;
  }
};

/**
 * Install the scoped auth shim. Returns an uninstall function that restores the exact
 * native `fetch` / `XMLHttpRequest` implementations captured at install time.
 */
export const installFlowEditorAuthShim = (): (() => void) => {
  const nativeFetch = window.fetch;
  const nativeOpen = XMLHttpRequest.prototype.open;
  const nativeSend = XMLHttpRequest.prototype.send;

  window.fetch = async function patchedFetch(input: any, init?: any) {
    if (!isFlowEditorUrl(resolveUrl(input))) {
      return nativeFetch.call(window, input, init);
    }

    const token = await acquireTokenSafely();
    if (!token) {
      return nativeFetch.call(window, input, init);
    }

    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set('authorization', token);
    return nativeFetch.call(window, input, { ...(init ?? {}), headers });
  } as typeof window.fetch;

  XMLHttpRequest.prototype.open = function patchedOpen(this: any, method: string, url: string | URL, ...rest: any[]) {
    // record the URL so `send` can decide whether this request is in scope
    this.__flowEditorShimUrl = typeof url === 'string' ? url : url.toString();
    return nativeOpen.call(this, method, url, ...(rest as [boolean, (string | null)?, (string | null)?]));
  } as typeof XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.send = async function patchedSend(this: any, body?: any) {
    // Out of scope: call native synchronously (no `await` runs before this point, so the
    // request's timing is identical to the unpatched native send).
    if (!isFlowEditorUrl(this.__flowEditorShimUrl)) {
      return nativeSend.call(this, body);
    }

    // In scope: attach a fresh token, but ALWAYS dispatch. If anything in the header step throws —
    // e.g. `setRequestHeader` raising InvalidStateError because the XHR was aborted/reopened during
    // the await — we must still call native `send`, never leave the request undispatched (the editor
    // would hang forever) or let the rejection escape as an unhandled promise rejection.
    try {
      const token = await acquireTokenSafely();
      if (token) {
        this.setRequestHeader('authorization', token);
      }
    } catch (err) {
      setLogs(`flowEditorAuthShim: failed to attach auth header, sending as-is - ${err}`, 'error');
    }
    return nativeSend.call(this, body);
  } as typeof XMLHttpRequest.prototype.send;

  return () => {
    window.fetch = nativeFetch;
    XMLHttpRequest.prototype.open = nativeOpen;
    XMLHttpRequest.prototype.send = nativeSend;
  };
};

export default installFlowEditorAuthShim;
