import { ApolloClient, InMemoryCache, fromPromise } from '@apollo/client';
import { createLink } from 'apollo-absinthe-upload-link';
import { onError } from '@apollo/link-error';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/link-context';

import { createClient } from 'graphql-ws';

import { getAuthSession, getUserSession } from 'services/AuthService';
import { getValidAccessToken, renewAccessToken, ForcedLogoutError, TransientRenewalError } from 'services/TokenManager';
import { CONNECTION_RECONNECT_ATTEMPTS } from 'common/constants';
import setLogs from './logs';
import { GLIFIC_API_URL, SOCKET } from '.';
import * as Sentry from '@sentry/react';

export const cache = new InMemoryCache({
  typePolicies: {
    VectorStore: {
      keyFields: false,
    },
    Query: {
      fields: {
        contactHistory: {
          keyArgs: false,

          merge(existing, incoming, { args }: any) {
            if (args.opts.offset === 0) {
              return incoming;
            }
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
});

// Detect an authentication failure on a GraphQL response, from either the network layer
// (Absinthe returns HTTP 401) or an auth-flavoured GraphQL error.
const isAuthError = (networkError: any, graphQLErrors: any): boolean => {
  if (networkError && (networkError.statusCode === 401 || `${networkError.message}`.includes('401'))) {
    return true;
  }
  return Boolean(
    graphQLErrors?.some(
      (err: any) =>
        err?.extensions?.code === 'UNAUTHENTICATED' || /unauthenticated|unauthorized/i.test(err?.message ?? '')
    )
  );
};

const gqlClient = () => {
  // Proactive auth: ask TokenManager for a valid token (renewing single-flight if needed) and
  // inject it. If renewal fails, TokenManager has already emitted the forced-logout (400/401) or
  // will surface a transient error; we let it propagate so the operation fails rather than silently
  // sending an expired token.
  const authLink = setContext(async (_, { headers }) => {
    // No session at all (pre-login / logged out): pass through without attempting a renewal, so an
    // unauthenticated operation never triggers a spurious forced logout.
    const hasSession = Boolean(getAuthSession('access_token') || getAuthSession('renewal_token'));
    const accessToken = hasSession ? await getValidAccessToken() : '';
    return {
      headers: {
        ...headers,
        authorization: accessToken || '',
      },
    };
  });

  // Reactive safety net: if a request still comes back 401 (e.g. token accepted by the frontend
  // buffer but rejected by the backend), renew once and replay the operation. All logout decisions
  // live in TokenManager — this link never navigates.
  const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        Sentry.captureException(new Error(`[GraphQL error]: ${message}`), {
          fingerprint: ['graphql-error', String(message)],
          extra: { locations, path },
        });
        // logged error in logflare
        setLogs(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`, 'error');
      });
    }

    if (networkError) {
      setLogs(`Network error: ${networkError} ${operation.variables}`, 'error');
    }

    if (isAuthError(networkError, graphQLErrors) && !operation.getContext().__authRetried) {
      operation.setContext({ __authRetried: true });

      return fromPromise(
        renewAccessToken().catch((err: unknown) => {
          // ForcedLogoutError -> TokenManager already emitted the forced logout.
          // TransientRenewalError -> renewal exhausted; give up without retrying.
          if (!(err instanceof ForcedLogoutError) && !(err instanceof TransientRenewalError)) {
            setLogs(`Token renewal error during 401 retry: ${err}`, 'error');
          }
          return null;
        })
      )
        .filter((token): token is string => token !== null)
        .flatMap(() => forward(operation));
    }

    return undefined;
  });

  const httpLink: any = createLink({ uri: GLIFIC_API_URL });

  const retryIf = (error: any) => {
    const doNotRetryCodes = [500, 400, 401];
    return !!error && !doNotRetryCodes.includes(error.statusCode);
  };

  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: Infinity,
      jitter: true,
    },
    attempts: {
      max: CONNECTION_RECONNECT_ATTEMPTS,
      retryIf,
    },
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: SOCKET,
      // Evaluated on every (re)connect so the socket authenticates with a fresh token instead of
      // the one captured at client-creation time. Falls back to the stored token if renewal throws
      // so we still attempt the connection.
      connectionParams: async () => {
        const hasSession = Boolean(getAuthSession('access_token') || getAuthSession('renewal_token'));
        let authToken: string | null = getAuthSession('access_token');
        if (hasSession) {
          try {
            authToken = await getValidAccessToken();
          } catch {
            authToken = getAuthSession('access_token');
          }
        }
        return {
          authToken,
          userId: getUserSession('id'),
        };
      },
      keepAlive: 30000,
      on: {
        closed: (event: any) => {
          setLogs(`WebSocket closed with code ${event.code} and reason: ${event.reason}`, 'error');
        },
        error: (error) => {
          setLogs(`WebSocket error: ${error}`, 'error');
        },
      },
    })
  );

  const link = retryLink.split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    errorLink.concat(authLink.concat(httpLink))
  );

  return new ApolloClient({
    link,
    cache,
  });
};

export default gqlClient;
