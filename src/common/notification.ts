import { NOTIFICATION } from '../graphql/queries/Notification';
export const setNotification = (client: any, message: string | null) => {
  client.writeQuery({
    query: NOTIFICATION,
    data: { message },
  });
};
