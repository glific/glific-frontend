export const setNotification = (client: any, query: any, message: string | null) => {
  client.writeQuery({
    query: query,
    data: { message },
  });
};
