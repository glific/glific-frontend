import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { hasSubscription } from '@jumpn/utils-graphql';
import absinthe from './absinthe';

// see example 1

const link = split(
  (operation) => hasSubscription(operation.query),
  absinthe,
  createHttpLink({ uri: 'http://localhost:4000/api' })
);

const gqlClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default gqlClient;
