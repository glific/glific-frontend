import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import absinthe from './absinthe';

const subscribe = require('@jumpn/utils-graphql');

const link = split(
  (operation) => subscribe.hasSubscription(operation.query),
  absinthe,
  createHttpLink({ uri: 'http://localhost:4000/api' })
);

const gqlClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default gqlClient;
