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
            fields: '{}',
            maskedPhone: '9194*****449',
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
        {
          body: '',
          contact: {
            id: '2',
            name: null,
            fields: '{"name":{"value":"field name"}}',
            maskedPhone: '9194*****449',
          },
          id: '2',
          messageNumber: null,
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
        {
          body: '',
          contact: {
            id: '3',
            name: null,
            fields: '{}',
            maskedPhone: '9194*****449',
          },
          id: '3',
          messageNumber: 23,
          insertedAt: '2021-06-16T09:00:00.000Z',
          remarks: 'This issue is resolved',
          status: 'open',
          topic: 'General',
          updatedAt: '2021-06-16T09:00:00.000Z',
          user: {
            id: '1',
            name: null,
          },
        },
        {
          body: '',
          contact: {
            id: '3',
            name: null,
            fields: '{}',
            maskedPhone: null,
          },
          id: '4',
          messageNumber: 23,
          insertedAt: '2021-06-16T09:00:00.000Z',
          remarks: 'This issue is resolved',
          status: 'open',
          topic: 'General',
          updatedAt: '2021-06-16T09:00:00.000Z',
          user: {
            id: '1',
            name: null,
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

export const closedTicketListQuery = {
  request: {
    query: TICKET_LIST_QUERY,
    variables: {
      filter: { status: 'closed' },
      opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'inserted_at' },
    },
  },

  result: {
    data: {
      tickets: [
        {
          body: 'I want to know how to submit activity',
          contact: {
            __typename: 'Contact',
            fields: '{}',
            id: '20',
            maskedPhone: '9876******10',
            name: null,
          },
          id: '7213',
          insertedAt: '2023-12-20T09:46:04Z',
          messageNumber: 14,
          remarks: 'Closed it as it was xyz question',
          status: 'closed',
          topic: 'Levelup',
          updatedAt: '2023-12-20T10:00:08Z',
          user: null,
        },
      ],
    },
  },
};

export const closedTicketCountQuery = {
  request: {
    query: TICKET_COUNT_QUERY,
    variables: { filter: { status: 'closed' } },
  },

  result: {
    data: {
      countTickets: 1,
    },
  },
};

export const myTicketsListQuery = {
  request: {
    query: TICKET_LIST_QUERY,
    variables: {
      filter: { status: 'open', userId: '1' },
      opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'inserted_at' },
    },
  },
  result: {
    data: {
      tickets: [
        {
          body: 'what is an interactive message?',
          contact: {
            __typename: 'Contact',
            fields: '{}',
            id: '20',
            maskedPhone: '9876******10',
            name: null,
          },
          id: '7213',
          insertedAt: '2023-12-20T09:46:04Z',
          messageNumber: 14,
          remarks: 'Closed it as it was xyz question',
          status: 'closed',
          topic: 'Levelup',
          updatedAt: '2023-12-20T10:00:08Z',
          user: null,
        },
      ],
    },
  },
};

export const myTicketsCountQuery = {
  request: {
    query: TICKET_COUNT_QUERY,
    variables: { filter: { status: 'open', userId: '1' } },
  },

  result: {
    data: {
      countTickets: 1,
    },
  },
};
