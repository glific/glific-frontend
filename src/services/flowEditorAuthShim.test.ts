import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FLOW_EDITOR_API } from 'config';
import { installFlowEditorAuthShim } from './flowEditorAuthShim';
import { getValidAccessToken } from './TokenManager';

vi.mock('./TokenManager', () => ({
  getValidAccessToken: vi.fn(),
}));

const mockedGetToken = vi.mocked(getValidAccessToken);

const IN_SCOPE_URL = `${FLOW_EDITOR_API}globals`;
const OUT_OF_SCOPE_URL = 'https://example.com/api/other';

// The "native" impls the shim will capture at install time (test doubles so nothing hits the network).
let nativeFetchMock: ReturnType<typeof vi.fn>;
let nativeOpenMock: ReturnType<typeof vi.fn>;
let nativeSendMock: ReturnType<typeof vi.fn>;
let setHeaderSpy: ReturnType<typeof vi.spyOn>;

// Real originals, restored after each test so patches never leak between tests.
const realFetch = window.fetch;
const realOpen = XMLHttpRequest.prototype.open;
const realSend = XMLHttpRequest.prototype.send;

beforeEach(() => {
  mockedGetToken.mockReset();
  mockedGetToken.mockResolvedValue('tok-123');

  nativeFetchMock = vi.fn().mockResolvedValue(new Response('{}'));
  nativeOpenMock = vi.fn();
  nativeSendMock = vi.fn();
  window.fetch = nativeFetchMock as unknown as typeof window.fetch;
  XMLHttpRequest.prototype.open = nativeOpenMock as unknown as typeof XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.send = nativeSendMock as unknown as typeof XMLHttpRequest.prototype.send;
  // setRequestHeader would throw unless the XHR is really OPENED; stub it since open is mocked.
  setHeaderSpy = vi.spyOn(XMLHttpRequest.prototype, 'setRequestHeader').mockImplementation(() => {});
});

afterEach(() => {
  setHeaderSpy.mockRestore();
  window.fetch = realFetch;
  XMLHttpRequest.prototype.open = realOpen;
  XMLHttpRequest.prototype.send = realSend;
});

const sendVia = async (xhr: XMLHttpRequest, body?: any): Promise<void> => {
  // patchedSend is async and returns a promise even though the DOM type says void.
  await (xhr.send as unknown as (b?: any) => Promise<void>).call(xhr, body);
};

describe('flowEditorAuthShim', () => {
  it('patches fetch/XHR on install and restores the exact native refs on uninstall', () => {
    const uninstall = installFlowEditorAuthShim();

    expect(window.fetch).not.toBe(nativeFetchMock);
    expect(XMLHttpRequest.prototype.open).not.toBe(nativeOpenMock);
    expect(XMLHttpRequest.prototype.send).not.toBe(nativeSendMock);

    uninstall();

    expect(window.fetch).toBe(nativeFetchMock);
    expect(XMLHttpRequest.prototype.open).toBe(nativeOpenMock);
    expect(XMLHttpRequest.prototype.send).toBe(nativeSendMock);
  });

  describe('fetch', () => {
    it('injects a fresh Authorization header for in-scope flow-editor URLs', async () => {
      const uninstall = installFlowEditorAuthShim();

      await window.fetch(IN_SCOPE_URL);

      expect(mockedGetToken).toHaveBeenCalledTimes(1);
      expect(nativeFetchMock).toHaveBeenCalledTimes(1);
      const [, init] = nativeFetchMock.mock.calls[0];
      expect((init.headers as Headers).get('authorization')).toBe('tok-123');
      uninstall();
    });

    it('leaves out-of-scope URLs completely untouched (no token fetch, no auth header)', async () => {
      const uninstall = installFlowEditorAuthShim();

      await window.fetch(OUT_OF_SCOPE_URL, { method: 'GET' });

      expect(mockedGetToken).not.toHaveBeenCalled();
      expect(nativeFetchMock).toHaveBeenCalledWith(OUT_OF_SCOPE_URL, { method: 'GET' });
      uninstall();
    });

    it('still sends the request (without auth) and never throws when renewal fails', async () => {
      mockedGetToken.mockRejectedValueOnce(new Error('forced logout'));
      const uninstall = installFlowEditorAuthShim();

      await expect(window.fetch(IN_SCOPE_URL)).resolves.toBeDefined();

      expect(nativeFetchMock).toHaveBeenCalledTimes(1);
      const [, init] = nativeFetchMock.mock.calls[0];
      // no token acquired -> no auth header injected, request proceeds as-is
      expect(init).toBeUndefined();
      uninstall();
    });
  });

  describe('XMLHttpRequest', () => {
    it('injects a fresh Authorization header for in-scope flow-editor URLs', async () => {
      const uninstall = installFlowEditorAuthShim();

      const xhr = new XMLHttpRequest();
      xhr.open('POST', IN_SCOPE_URL);
      await sendVia(xhr, 'body');

      expect(mockedGetToken).toHaveBeenCalledTimes(1);
      expect(setHeaderSpy).toHaveBeenCalledWith('authorization', 'tok-123');
      expect(nativeSendMock).toHaveBeenCalledTimes(1);
      uninstall();
    });

    it('leaves out-of-scope URLs untouched (no token fetch, no auth header)', async () => {
      const uninstall = installFlowEditorAuthShim();

      const xhr = new XMLHttpRequest();
      xhr.open('GET', OUT_OF_SCOPE_URL);
      await sendVia(xhr);

      expect(mockedGetToken).not.toHaveBeenCalled();
      expect(setHeaderSpy).not.toHaveBeenCalledWith('authorization', expect.anything());
      expect(nativeSendMock).toHaveBeenCalledTimes(1);
      uninstall();
    });
  });
});
