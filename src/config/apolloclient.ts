import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { onError } from "@apollo/link-error";
import absinthe from './absinthe';
import { URI } from '.';
import { setContext } from '@apollo/link-context';

const subscribe = require('@jumpn/utils-graphql');

const gqlClient = () => {
  // build authentication link
  const authLink = setContext((_, { headers }) => {
    // get the session object from local storage if it exists
    const session = localStorage.getItem('glific_session');
    // parse the token and send it to backend
    const accessToken = session ? JSON.parse(session).access_token : null;

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
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );

    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const httpLink = createHttpLink({ uri: URI });

  const link = split(
    (operation) => subscribe.hasSubscription(operation.query),
    absinthe,
    errorLink.concat(authLink.concat(httpLink))
  );

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
};
export default gqlClient;
