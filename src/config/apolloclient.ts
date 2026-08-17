import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from '@apollo/client';
import { ErrorLink } from '@apollo/client/link/error';
import { SetContextLink } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { print } from 'graphql/language/printer';

import { createClient } from 'graphql-ws';

import { checkAuthStatusService, renewAuthToken, getAuthSession, getUserSession } from 'services/AuthService';
import { CONNECTION_RECONNECT_ATTEMPTS } from 'common/constants';
import setLogs from './logs';
import { GLIFIC_API_URL, SOCKET } from '.';
import { extractFiles } from './extractFiles';
import * as Sentry from '@sentry/react';

export const cache = new InMemoryCache({
  typePolicies: {
    VectorStore: {
      keyFields: false,
    },
    Query: {
      fields: {
        contactHistory: {
          keyArgs: false,

          merge(existing, incoming, { args }: any) {
            if (args.opts.offset === 0) {
              return incoming;
            }
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
});

// Absinthe (Elixir GraphQL) file uploads use a multipart request that isn't part of the core
// GraphQL/Apollo spec. apollo-absinthe-upload-link (the previous dependency for this) is
// unmaintained and imports internals removed in Apollo Client 4, so this link is a native
// replacement covering only what this app actually uses (no custom fetch/credentials options).
const createUploadLink = (uri: string) =>
  new ApolloLink((operation, forward) => {
    if (typeof FormData === 'undefined') {
      return forward(operation);
    }

    const { variables, files } = extractFiles(operation.variables);
    if (files.length === 0) {
      return forward(operation);
    }

    return new Observable((observer) => {
      const { headers } = operation.getContext();
      const formData = new FormData();
      formData.append('query', print(operation.query));
      formData.append('variables', JSON.stringify(variables));
      files.forEach(({ name, file }) => formData.append(name, file as any));

      fetch(uri, {
        method: 'POST',
        headers: headers || {},
        body: formData,
      })
        .then((response) => response.json())
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => observer.error(error));
    });
  });

const gqlClient = (navigate: any) => {
  let isLoggingOut = false;

  // Proactively renews the access token before it expires (checkAuthStatusService applies a
  // 30s buffer) and holds the outgoing operation until renewal completes. tokenRenewalManager
  // (services/TokenRenewalService) already deduplicates concurrent renewal calls into a single
  // in-flight request and already persists the refreshed session, so this link only needs to
  // wait for it and forward the operation - no queueing logic needed here.
  const refreshTokenLink = new ApolloLink((operation, forward) => {
    return new Observable((observer) => {
      let subscription: any;

      (async () => {
        try {
          if (!checkAuthStatusService()) {
            await renewAuthToken();
          }
          subscription = forward(operation).subscribe(observer);
        } catch (err: any) {
          if (!isLoggingOut) {
            isLoggingOut = true;
            /* eslint-disable no-console */
            console.warn('Your refresh token is invalid. Try to relogin');
            console.error(err);
            /* eslint-enable no-console */
            setLogs('Token fetch error', 'error');
            setLogs(err.message, 'error');
            navigate('/logout/session');
          }
          observer.error(err);
        }
      })();

      return () => {
        if (subscription) subscription.unsubscribe();
      };
    });
  });

  // build authentication link
  const authLink = new SetContextLink((prevContext) => {
    // get auth token
    const accessToken = getAuthSession('access_token');

    return {
      headers: {
        ...prevContext.headers,
        authorization: accessToken || '',
      },
    };
  });

  const errorLink = new ErrorLink(({ error, operation }) => {
    if (CombinedGraphQLErrors.is(error)) {
      error.errors.forEach(({ message, locations, path }) => {
        Sentry.captureException(new Error(`[GraphQL error]: ${message}`), {
          fingerprint: ['graphql-error', String(message)],
          extra: { locations, path },
        });
        // logged error in logflare
        setLogs(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`, 'error');
      });
      return;
    }

    setLogs(`Network error: ${error} ${operation.variables}`, 'error');
    if (error?.message?.includes('Received status code 401') || error?.message?.includes('401')) {
      if (!isLoggingOut) {
        isLoggingOut = true;
        navigate('/logout/session');
      }
    }
  });

  const httpLink = ApolloLink.from([createUploadLink(GLIFIC_API_URL), new HttpLink({ uri: GLIFIC_API_URL })]);

  const retryIf = (error: any) => {
    if (isLoggingOut) {
      console.log('Skipping retry - logging out');
      return false;
    }
    const doNotRetryCodes = [500, 400, 401];
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

  const wsLink = new GraphQLWsLink(
    createClient({
      url: SOCKET,
      connectionParams: {
        authToken: getAuthSession('access_token'),
        userId: getUserSession('id'),
      },
      keepAlive: 30000,
      on: {
        closed: (event: any) => {
          setLogs(`WebSocket closed with code ${event.code} and reason: ${event.reason}`, 'error');
        },
        error: (error) => {
          setLogs(`WebSocket error: ${error}`, 'error');
        },
      },
    })
  );

  const link = retryLink.split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    wsLink,
    ApolloLink.from([refreshTokenLink, errorLink, authLink, httpLink])
  );

  return new ApolloClient({
    link,
    cache,
  });
};

export default gqlClient;
