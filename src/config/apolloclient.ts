import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createLink } from 'apollo-absinthe-upload-link';
import { onError } from '@apollo/link-error';
import { RetryLink } from '@apollo/client/link/retry';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/link-context';

import { createClient } from 'graphql-ws';

import {
  checkAuthStatusService,
  renewAuthToken,
  getAuthSession,
  setAuthSession,
  getUserSession,
} from 'services/AuthService';
import { CONNECTION_RECONNECT_ATTEMPTS } from 'common/constants';
import setLogs from './logs';
import { GLIFIC_API_URL, SOCKET } from '.';
import * as Sentry from '@sentry/react';

export const cache = new InMemoryCache({
  typePolicies: {
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

// Export the WebSocket client so it can be accessed elsewhere
export const wsClient = createClient({
  url: SOCKET,
  connectionParams: {
    authToken: getAuthSession('access_token'),
    userId: getUserSession('id'),
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
});

const gqlClient = (navigate: any) => {
  let isLoggingOut = false;

  const refreshTokenLink: any = new TokenRefreshLink({
    accessTokenField: 'access_token',
    isTokenValidOrUndefined: async () => checkAuthStatusService(),
    fetchAccessToken: async () => renewAuthToken(),
    handleFetch: () => {},
    handleResponse: (_operation, accessTokenField) => (response: any) => {
      // here we can both success and failures
      const tokenResponse: any = [];

      // in case of successful token renewal
      if (response.data) {
        // lets set the session
        setAuthSession(response.data.data);

        // we need to return below as handleFetch expects it
        tokenResponse[accessTokenField] = response.data.data.access_token;
      }

      return tokenResponse;
    },
    handleError: (err: Error) => {
      // Prevent multiple logout attempts
      if (isLoggingOut) return;
      isLoggingOut = true;

      // full control over handling token fetch Error
      /* eslint-disable */
      console.warn('Your refresh token is invalid. Try to relogin');
      console.error(err);

      setLogs('Token fetch error', 'error');
      setLogs(err.message, 'error');
      /* eslint-enable */
      navigate('/logout/session');
    },
  });

  // build authentication link
  const authLink = setContext((_, { headers }) => {
    // get auth token
    const accessToken = getAuthSession('access_token');

    return {
      headers: {
        ...headers,
        authorization: accessToken || '',
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) => {
        // eslint-disable-next-line
        Sentry.captureException(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
        // logged error in logflare
        return setLogs(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`, 'error');
      });

    if (networkError) {
      setLogs(`Network error: ${networkError} ${operation.variables}`, 'error');
      if (networkError.message.includes('Received status code 401') || networkError.message.includes('401')) {
        if (!isLoggingOut) {
          isLoggingOut = true;
          navigate('/logout/session');
        }
      }
    }
  });

  const httpLink: any = createLink({ uri: GLIFIC_API_URL });

  const retryIf = (error: any) => {
    if (isLoggingOut) {
      console.log('Skipping retry - logging out');
      return false;
    }
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

  // Use the exported wsClient
  const wsLink = new GraphQLWsLink(wsClient);

  const link = retryLink.split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    refreshTokenLink.concat(errorLink.concat(authLink.concat(httpLink)))
  );

  return new ApolloClient({
    link,
    cache,
  });
};

export default gqlClient;
