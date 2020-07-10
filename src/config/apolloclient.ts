import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import absinthe from './absinthe';
import { URI } from '.';
import { setContext } from '@apollo/link-context';

const subscribe = require('@jumpn/utils-graphql');

const gqlClient = (auth_token: string | null) => {
  const authLink = setContext((_, { headers }) => {
    return {
      headers: {
        ...headers,
        Authorization: auth_token ? auth_token : '',
      },
    };
  });

  const link = split(
    (operation) => subscribe.hasSubscription(operation.query),
    absinthe,
    authLink.concat(createHttpLink({ uri: URI }))
  );
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
export default gqlClient;
