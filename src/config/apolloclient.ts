import { ApolloClient, HttpLink, InMemoryCache, split, ApolloLink } from '@apollo/client';
import { WebSocketLink } from '@apollo/link-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/api'
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/socket/websocket',
  options: {
    reconnect: true
  }
});

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink as any, // "as any" is used to fix typescript error
  httpLink,
);

const link = ApolloLink.from([splitLink]);

const gqlClient = new ApolloClient({
  cache: new InMemoryCache(),
  link
});

export default gqlClient;
