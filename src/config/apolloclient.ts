import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { onError } from '@apollo/link-error';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import absinthe from './absinthe';

import { URI } from '.';
import { setContext } from '@apollo/link-context';
import {
  checkAuthStatusService,
  renewAuthToken,
  getAuthSession,
  setAuthSession,
} from '../services/AuthService';

const subscribe = require('@jumpn/utils-graphql');

const gqlClient = () => {
  const refreshTokenLink = new TokenRefreshLink({
    accessTokenField: 'access_token',
    isTokenValidOrUndefined: () => checkAuthStatusService(),
    fetchAccessToken: () => renewAuthToken(),
    handleFetch: (accessToken: any) => {},
    handleResponse: (operation, accessTokenField) => (response: any) => {
      // lets set the session
      setAuthSession(JSON.stringify(response.data.data));

      // we need to return below as handleFetch expects it
      const tokenResponse: any = [];
      tokenResponse[accessTokenField] = response.data.data.access_token;
      return tokenResponse;
    },
    handleError: (err: Error) => {
      // full control over handling token fetch Error
      console.warn('Your refresh token is invalid. Try to relogin');
      console.error(err);
      // gracefully logout
      window.location.href = '/logout';
    },
  });

  // build authentication link
  const authLink = setContext((_, { headers }) => {
    // get auth token
    const accessToken = getAuthSession('access_token');

    return {
      headers: {
        ...headers,
        Authorization: accessToken ? accessToken : '',
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      );

    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const httpLink = createHttpLink({ uri: URI });

  const link = split(
    (operation) => subscribe.hasSubscription(operation.query),
    absinthe,
    refreshTokenLink.concat(errorLink.concat(authLink.concat(httpLink)) as any) as any
  );

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
export default gqlClient;
