import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import absinthe from './absinthe';
import { URI } from './../config';

const subscribe = require('@jumpn/utils-graphql');

const link = split(
  (operation) => subscribe.hasSubscription(operation.query),
  absinthe,
  createHttpLink({ uri: URI })
);

const gqlClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default gqlClient;
