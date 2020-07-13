import { NOTIFICATION, ERROR } from '../graphql/queries/Notification';
import { useApolloClient } from '@apollo/client';

const client = useApolloClient();

export const setNotification = (client: any, message: string | null) => {
  client.writeQuery({
    query: NOTIFICATION,
    data: { message },
  });
};

export const setErrorMessage = (message: any) => {
  client.writeQuery({
    query: ERROR,
    data: { message },
  });
}