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
  checkAndRenewToken,
} from 'services/AuthService';
import { CONNECTION_RECONNECT_ATTEMPTS } from 'common/constants';
import { Logout } from 'containers/Auth/Logout/Logout';
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

const gqlClient = (navigate: any) => {
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
      // full control over handling token fetch Error
      /* eslint-disable */
      console.warn('Your refresh token is invalid. Try to relogin');
      console.error(err);
      // logged error in logflare

      setLogs('Token fetch error', 'error');
      setLogs(err.message, 'error');
      /* eslint-enable */
      // gracefully logout
      return Logout;
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

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) => {
        // eslint-disable-next-line
        Sentry.captureException(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
        // logged error in logflare
        return setLogs(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`, 'error');
      });

    if (networkError) {
      // @ts-ignore
      switch (networkError.statusCode) {
        case 401:
          setLogs('401 detected. Attempting token renewal before logout.', 'info', true);

          // check if token exists
          checkAndRenewToken(navigate);
          break;
        default:
          // eslint-disable-next-line
          Sentry.captureException(`[Network error]: ${networkError}`);
          // logged error in logflare
          setLogs(`[Network error]: ${networkError}`, 'error');
      }
    }
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
      connectionParams: {
        authToken: getAuthSession('access_token'),
        userId: getUserSession('id'),
      },
    })
  );

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
