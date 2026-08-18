import 'mocks/matchMediaMock';
import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { cleanup, configure } from '@testing-library/react';
import { MockLink } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { LocalState } from '@apollo/client/local-state';

configure({ asyncUtilTimeout: 2000 });

// Apollo Client 4's MockLink defaults to a randomized "realistic" delay (simulating network
// latency) instead of resolving on the next macrotask. This suite predates that change and has
// many assertions that read the DOM synchronously right after render, so restore the old
// near-immediate resolution globally rather than rewriting every test to await/findBy*. A delay
// of 1ms (rather than 0) still resolves on a real timer tick instead of a microtask, so tests
// that assert an initial loading state before the mock resolves keep seeing it.
MockLink.defaultOptions.delay = 1;

// Apollo Client 4 throws if a query contains @client fields (e.g. NOTIFICATION/ERROR_MESSAGE,
// SEARCH_OFFSET, SCROLL_HEIGHT) and no LocalState is configured, once that query ever misses the
// cache. This app has no local resolvers - it writes @client fields directly via cache.writeQuery
// - so a resolver-less LocalState is enough to satisfy the check everywhere MockedProvider is used,
// without touching every individual test file.
(MockedProvider as any).defaultProps = {
  ...(MockedProvider as any).defaultProps,
  localState: new LocalState(),
};

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

import.meta.env.VITE_WEB_SOCKET = 'ws://localhost/socket';

vi.mock('react-media-recorder', () => {
  return {
    useReactMediaRecorder: () => {
      return {
        status: 'idle',
        error: null,
        startRecording: () => {},
        stopRecording: () => {},
        mediaBlobUrl: () => {},
        clearBlobUrl: () => {},
      };
    },
  };
});

vi.mock('react-i18next', async () => {
  const reactI18next = await vi.importActual<any>('react-i18next');
  return {
    // this mock makes sure any components using the translate hook can use it without a warning being shown
    useTranslation: () => {
      return {
        t: (str: string) => str,
        i18n: {
          changeLanguage: () => new Promise(() => {}),
        },
      };
    },
    initReactI18next: reactI18next.initReactI18next,
  };
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('services/TrackService', () => {
  return {
    default: () => vi.fn(),
    Track: () => vi.fn(),
  };
});

vi.mock('config/logs', () => {
  return {
    default: () => vi.fn(),
    setLogs: () => vi.fn(),
  };
});

window.ResizeObserver = ResizeObserver;
window.HTMLDocument = Document;
// A bare `vi.fn()` returns `undefined`, and Apollo Client 4's HttpLink calls `.then()` on the
// fetch call directly - any query that isn't fully mocked and genuinely reaches this (e.g. a raw
// ApolloClient/HttpLink in a test with no matching MockedProvider mock) throws synchronously
// instead of surfacing as a normal, catchable async rejection. Reject instead, matching what an
// unmocked fetch in a test environment actually represents (no network available).
window.fetch = vi.fn(() => Promise.reject(new Error('fetch is not mocked in tests'))) as any;

// Apollo Client 4's internal query tracking (and its MockedProvider unmount cleanup) rejects an
// internal promise with an "AbortError"/"QueryManager stopped" error whenever an ObservableQuery
// is torn down before it ever received data - e.g. a component unmounting while a mocked query's
// artificial delay hasn't resolved yet. Nothing in app or test code holds a reference to that
// promise to catch it, so it otherwise surfaces as a Vitest-failing unhandled rejection for a
// perfectly normal test teardown. Vitest treats any additional 'unhandledRejection' listener as a
// sign the rejection is being handled by user code, so filter out only this known-benign class
// here and let anything else re-surface as an uncaught exception (still fails the run, on its own
// listener) so real bugs stay visible.
const BENIGN_APOLLO_CLEANUP_REJECTIONS = [
  'QueryManager stopped while query was in flight',
  'The operation was aborted',
];
(globalThis as any).process?.on('unhandledRejection', (reason: any) => {
  const message = reason?.message ?? String(reason);
  if (BENIGN_APOLLO_CLEANUP_REJECTIONS.some((pattern) => message.includes(pattern))) {
    return;
  }
  queueMicrotask(() => {
    throw reason;
  });
});

window.URL.createObjectURL = vi.fn();

(globalThis.crypto as any).randomUUID = () => 'mock-request-id-1234-5678-90ab-cdef00000000';

if (!globalThis.TextEncoder) {
  Object.defineProperty(globalThis, 'TextEncoder', {
    value: TextEncoder,
    writable: true,
    configurable: true,
  });
}
if (!globalThis.TextDecoder) {
  Object.defineProperty(globalThis, 'TextDecoder', {
    value: TextDecoder,
    writable: true,
    configurable: true,
  });
}
