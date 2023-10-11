import { GET_TICKET, TICKET_COUNT_QUERY, TICKET_LIST_QUERY } from 'graphql/queries/Ticket';

export const getTicketQuery = {
  request: {
    query: GET_TICKET,
    variables: { id: '1' },
  },
  result: {
    data: {
      ticket: {
        ticket: {
          body: 'Please resolve this issue',
          contact: {
            id: '1',
          },
          id: '1',
          insertedAt: '2021-06-16T09:00:00.000Z',
          remarks: 'The issue was resolved',
          status: 'open',
          topic: 'General',
          updatedAt: '2021-06-16T09:00:00.000Z',
          user: {
            id: '1',
          },
        },
      },
    },
  },
};

export const ticketListQuery = {
  request: {
    query: TICKET_LIST_QUERY,
    variables: {
      filter: { status: 'open' },
      opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'inserted_at' },
    },
  },

  result: {
    data: {
      tickets: [
        {
          body: '',
          contact: {
            id: '1',
            name: 'NGO support',
          },
          id: '1',
          insertedAt: '2021-06-16T09:00:00.000Z',
          remarks: 'This issue is resolved',
          status: 'open',
          topic: 'General',
          updatedAt: '2021-06-16T09:00:00.000Z',
          user: {
            id: '1',
            name: 'Glific user',
          },
        },
      ],
    },
  },
};

export const ticketCountQuery = {
  request: {
    query: TICKET_COUNT_QUERY,
    variables: { filter: { status: 'open' } },
  },

  result: {
    data: {
      countTickets: 1,
    },
  },
};
