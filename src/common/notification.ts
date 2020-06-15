export const notify = (client: any, query: any, message: string | null) =>
  client.writeQuery({
    query: query,
    data: { message },
  });
