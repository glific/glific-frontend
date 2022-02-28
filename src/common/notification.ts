import { cache } from 'config/apolloclient';
import { NOTIFICATION, ERROR_MESSAGE } from 'graphql/queries/Notification';

export const setNotification = (
  message: string | null,
  severity: string | null = 'success',
  hideDuration: number | null = 5000
) => {
  cache.writeQuery({
    query: NOTIFICATION,
    data: { message, severity, hideDuration },
  });
};

export const setErrorMessage = (error: any, title?: string) => {
  let errorMessage;
  // error === '' when we are resetting the error
  if (error !== '') {
    errorMessage = {
      title,
      message: error.message,
      type: error.name,
      networkError: error.networkError,
      graphqlError: error.graphQLErrors,
    };
  } else {
    errorMessage = '';
  }

  cache.writeQuery({
    query: ERROR_MESSAGE,
    data: { errorMessage },
  });
};
