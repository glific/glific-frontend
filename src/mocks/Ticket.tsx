import {
  EXPORT_SUPPORT_TICKETS,
  GET_TICKET,
  TICKET_COUNT_QUERY,
  TICKET_LIST_QUERY,
  UPDATE_TICKETS_STATUS,
} from 'graphql/queries/Ticket';

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
            id: '2',
            name: 'Glific contact',
          },
          id: '1',
          insertedAt: '2021-06-16T09:00:00.000Z',
          remarks: 'The issue was resolved',
          status: 'open',
          topic: 'General',
          updatedAt: '2021-06-16T09:00:00.000Z',
          user: {
            id: '1',
            name: 'John Doe',
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
          messageNumber: 23,
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

export const bulkActionQuery = {
  request: {
    query: UPDATE_TICKETS_STATUS,
    variables: { input: { status: 'closed', topic: 'dob' } },
  },
  result: {
    data: {
      updateTicketStatusBasedOnTopic: {
        __typename: 'BulkTicketResult',
        message: 'Updated successfully',
        success: true,
      },
    },
  },
};

export const exportTicketsMock = {
  request: {
    query: EXPORT_SUPPORT_TICKETS,
    variables: { filter: { startDate: '2024-01-15', endDate: '2024-04-15' } },
  },
  result: {
    data: {
      fetchSupportTickets: 'status,body,inserted_at,topic,opened_by,assigned_to\n',
    },
  },
};
