import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { onError } from '@apollo/link-error';
import { RetryLink } from '@apollo/client/link/retry';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import { setContext } from '@apollo/link-context';

import absinthe from './absinthe';
import { GLIFIC_API_URL } from '.';
import {
  checkAuthStatusService,
  renewAuthToken,
  getAuthSession,
  setAuthSession,
} from '../services/AuthService';
import { CONNECTION_RECONNECT_ATTEMPTS } from '../common/constants';
import { Logout } from '../containers/Auth/Logout/Logout';

const subscribe = require('@jumpn/utils-graphql');

const gqlClient = () => {
  const refreshTokenLink = new TokenRefreshLink({
    accessTokenField: 'access_token',
    isTokenValidOrUndefined: () => checkAuthStatusService(),
    fetchAccessToken: async () => renewAuthToken(),
    handleFetch: () => {},
    handleResponse: (_operation, accessTokenField) => (response: any) => {
      // lets set the session
      setAuthSession(JSON.stringify(response.data.data));

      // we need to return below as handleFetch expects it
      const tokenResponse: any = [];
      tokenResponse[accessTokenField] = response.data.data.access_token;
      return tokenResponse;
    },
    handleError: (err: Error) => {
      // full control over handling token fetch Error
      /* eslint-disable */
      console.warn('Your refresh token is invalid. Try to relogin');
      console.error(err);
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
        Authorization: accessToken || '',
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        // eslint-disable-next-line
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      );

    if (networkError) {
      // eslint-disable-next-line
      console.log(`[Network error]: ${networkError}`);
    }
  });

  const httpLink = createHttpLink({ uri: GLIFIC_API_URL });

  const retryIf = (error: any) => {
    const doNotRetryCodes = [500, 400];
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

  const link = retryLink.split(
    (operation) => subscribe.hasSubscription(operation.query),
    absinthe,
    refreshTokenLink.concat(errorLink.concat(authLink.concat(httpLink)))
  );

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
export default gqlClient;
