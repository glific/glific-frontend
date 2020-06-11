import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const gqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000/api',
  }),
});

export default gqlClient;
