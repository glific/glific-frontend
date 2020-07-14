import { NOTIFICATION, ERROR } from '../graphql/queries/Notification';
export const setNotification = (client: any, message: string | null) => {
  client.writeQuery({
    query: NOTIFICATION,
    data: { message },
  });
};

export const setErrorMessage = (client: any, message: any) => {
  client.writeQuery({
    query: ERROR,
    data: { message },
  });
}