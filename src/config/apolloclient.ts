import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { URI } from './../config';

const gqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: URI,
  }),
});

export default gqlClient;
