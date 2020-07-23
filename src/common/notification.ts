import { ApolloError } from '@apollo/client';
import { NOTIFICATION, ERROR_MESSAGE } from '../graphql/queries/Notification';

export const setNotification = (client: any, message: string | null) => {
  client.writeQuery({
    query: NOTIFICATION,
    data: { message },
  });
};

export const setErrorMessage = (client: any, error: ApolloError | '') => {
  let errorMessage;

  // error === '' when we are reseting the error
  if (error !== '') {
    errorMessage = {
      message: error.message,
      type: error.name,
      networkError: error.networkError,
      graphqlError: error.graphQLErrors
    }
  } else {
    errorMessage = '';
  }

  client.writeQuery({
    query: ERROR_MESSAGE,
    data: { errorMessage },
  });
}