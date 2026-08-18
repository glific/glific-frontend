import { gql } from '@apollo/client';

import { setAuthSession, clearAuthSession, checkAuthStatusService, renewAuthToken } from 'services/AuthService';
import gqlClient, { cache } from './apolloclient';

// gqlClient() constructs a GraphQLWsLink via graphql-ws's createClient. Even though it's lazy
// (no real socket opens until something subscribes), stub it out so these query/mutation-focused
// tests never touch a real WebSocket implementation.
vi.mock('graphql-ws', () => ({
  createClient: vi.fn(() => ({
    dispose: vi.fn(),
    subscribe: vi.fn(),
    on: vi.fn(),
  })),
}));

// checkAuthStatusService/renewAuthToken drive the refreshTokenLink branches under test, so they're
// mocked per-test. Everything else (getAuthSession/setAuthSession/...) keeps its real
// localStorage-backed implementation.
vi.mock('services/AuthService', async () => {
  const actual = await vi.importActual<typeof import('services/AuthService')>('services/AuthService');
  return {
    ...actual,
    checkAuthStatusService: vi.fn(),
    renewAuthToken: vi.fn(),
  };
});

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}));

// Override the global (setupTests.ts) config/logs stub, which discards its arguments, so the
// production code's setLogs(...) calls are visible to assertions here.
vi.mock('config/logs', () => ({
  default: vi.fn(),
}));

import * as Sentry from '@sentry/react';
import setLogs from 'config/logs';

const mockedCheckAuthStatusService = vi.mocked(checkAuthStatusService);
const mockedRenewAuthToken = vi.mocked(renewAuthToken);

const TEST_QUERY = gql`
  query TestQuery {
    testField
  }
`;

const TEST_MUTATION = gql`
  mutation TestMutation($file: Upload) {
    uploadTestFile(file: $file) {
      success
    }
  }
`;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

describe('apolloclient', () => {
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    cache.reset();
    navigate = vi.fn();
    mockedCheckAuthStatusService.mockReturnValue(true);
    mockedRenewAuthToken.mockResolvedValue({ data: {} });
    setAuthSession({
      access_token: 'access-token',
      renewal_token: 'renewal-token',
      token_expiry_time: new Date(Date.now() + 60 * 60 * 1000),
    });
  });

  afterEach(() => {
    clearAuthSession();
    vi.unstubAllGlobals();
  });

  test('forwards a query straight through when the token is valid', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { testField: 'hello' } })));

    const client = gqlClient(navigate);
    const { data } = await client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' });

    expect(data).toEqual({ testField: 'hello' });
    expect(mockedRenewAuthToken).not.toHaveBeenCalled();
  });

  test('renews the token before forwarding when the session is not valid', async () => {
    mockedCheckAuthStatusService.mockReturnValue(false);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { testField: 'hello' } })));

    const client = gqlClient(navigate);
    const { data } = await client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' });

    expect(data).toEqual({ testField: 'hello' });
    expect(mockedRenewAuthToken).toHaveBeenCalledTimes(1);
  });

  test('logs out via navigate when token renewal fails, and reports the error', async () => {
    mockedCheckAuthStatusService.mockReturnValue(false);
    mockedRenewAuthToken.mockRejectedValue(new Error('refresh token expired'));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { testField: 'hello' } })));

    const client = gqlClient(navigate);

    await expect(client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' })).rejects.toThrow();

    expect(navigate).toHaveBeenCalledWith('/logout/session');
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(setLogs).toHaveBeenCalledWith('Token fetch error', 'error');
    expect(setLogs).toHaveBeenCalledWith('refresh token expired', 'error');
  });

  test('only navigates once across repeated token-renewal failures on the same client', async () => {
    mockedCheckAuthStatusService.mockReturnValue(false);
    mockedRenewAuthToken.mockRejectedValue(new Error('refresh token expired'));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { testField: 'hello' } })));

    const client = gqlClient(navigate);

    await expect(client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' })).rejects.toThrow();
    await expect(
      client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache', variables: { extra: 1 } })
    ).rejects.toThrow();

    // isLoggingOut latches after the first failure - the second failure should still reject
    // (observer.error still fires) but must not re-trigger the navigate/console/log side effects.
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  test('reports GraphQL errors to Sentry and logs, without logging the user out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          data: null,
          errors: [{ message: 'Boom', locations: [{ line: 1, column: 1 }], path: ['testField'] }],
        })
      )
    );

    const client = gqlClient(navigate);

    await expect(client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' })).rejects.toThrow('Boom');

    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.objectContaining({ message: '[GraphQL error]: Boom' }),
      expect.objectContaining({
        fingerprint: ['graphql-error', 'Boom'],
        extra: { locations: [{ line: 1, column: 1 }], path: ['testField'] },
      })
    );
    expect(setLogs).toHaveBeenCalledWith(
      '[GraphQL error]: Message: Boom, Location: [object Object], Path: testField',
      'error'
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  test('logs the user out on a 401 network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 })));

    const client = gqlClient(navigate);

    await expect(client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' })).rejects.toThrow();

    expect(navigate).toHaveBeenCalledWith('/logout/session');
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  test('only navigates once across repeated 401 network errors on the same client', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 })));
    const client = gqlClient(navigate);

    await expect(client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' })).rejects.toThrow();
    // isLoggingOut is now latched - a second 401 on the same client must hit errorLink's
    // "already logging out" branch and skip navigate a second time.
    await expect(
      client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache', variables: { extra: 1 } })
    ).rejects.toThrow();

    expect(navigate).toHaveBeenCalledTimes(1);
  });

  test('sends an empty authorization header when there is no session', async () => {
    clearAuthSession();
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { testField: 'hello' } }));
    vi.stubGlobal('fetch', fetchMock);

    const client = gqlClient(navigate);
    await client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' });

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.headers.authorization).toBe('');
  });

  test('does not log out on a non-401 network error', async () => {
    // retryLink wraps this whole chain, and retryIf only skips a retry for statusCode
    // 400/401/500 - attach one of those so the assertion doesn't wait through 5 retries.
    const error: any = new TypeError('Failed to fetch');
    error.statusCode = 500;
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    const client = gqlClient(navigate);

    await expect(client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' })).rejects.toThrow();

    expect(navigate).not.toHaveBeenCalled();
  });

  test('only navigates once when a 401 is followed by a token-renewal failure on the same client', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unauthorized', { status: 401 })));
    const client = gqlClient(navigate);
    await expect(client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache' })).rejects.toThrow();
    expect(navigate).toHaveBeenCalledTimes(1);

    // isLoggingOut is shared between refreshTokenLink and errorLink within one gqlClient() call.
    // A subsequent renewal failure on the same client must hit the "already logging out" branch.
    mockedCheckAuthStatusService.mockReturnValue(false);
    mockedRenewAuthToken.mockRejectedValue(new Error('refresh token expired'));

    await expect(
      client.query({ query: TEST_QUERY, fetchPolicy: 'no-cache', variables: { extra: 1 } })
    ).rejects.toThrow();

    expect(navigate).toHaveBeenCalledTimes(1);
  });

  test('uploads a file via multipart/form-data instead of the plain HTTP link', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: { uploadTestFile: { success: true } } }));
    vi.stubGlobal('fetch', fetchMock);

    const client = gqlClient(navigate);
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    const { data } = await client.mutate({
      mutation: TEST_MUTATION,
      variables: { file },
      fetchPolicy: 'no-cache' as any,
    });

    expect(data).toEqual({ uploadTestFile: { success: true } });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.method).toBe('POST');
    expect(requestInit.body).toBeInstanceOf(FormData);
    const formData = requestInit.body as FormData;
    expect(formData.get('media') ?? formData.get('file')).toBeTruthy();
    // authLink runs before the upload link, so its authorization header should already be present.
    expect(requestInit.headers.authorization).toBe('access-token');
  });

  test('propagates a fetch failure during file upload as an observer error', async () => {
    // see the retry-skip comment above - avoid waiting through retryLink's backoff here too.
    const error: any = new Error('network down');
    error.statusCode = 500;
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error));

    const client = gqlClient(navigate);
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

    await expect(
      client.mutate({ mutation: TEST_MUTATION, variables: { file }, fetchPolicy: 'no-cache' as any })
    ).rejects.toThrow();
  });

  test('falls back to forwarding the operation when FormData is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: { uploadTestFile: { success: true } } })));

    const originalFormData = globalThis.FormData;
    // @ts-expect-error - simulate an environment without FormData support
    delete globalThis.FormData;

    try {
      const client = gqlClient(navigate);
      const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });

      const { data } = await client.mutate({
        mutation: TEST_MUTATION,
        variables: { file },
        fetchPolicy: 'no-cache' as any,
      });

      expect(data).toEqual({ uploadTestFile: { success: true } });
    } finally {
      globalThis.FormData = originalFormData;
    }
  });
});
