import { NOTIFICATION, ERROR_MESSAGE } from '../graphql/queries/Notification';

export const setNotification = (client: any, message: string | null) => {
  client.writeQuery({
    query: NOTIFICATION,
    data: { message },
  });
};

export const setErrorMessage = (client: any, errorMessage: any) => {
  client.writeQuery({
    query: ERROR_MESSAGE,
    data: { errorMessage },
  });
}