import {
  GET_CONVERSATION_QUERY,
  GET_CONVERSATION_MESSAGE_QUERY,
  FILTER_CONVERSATIONS_QUERY,
} from '../../graphql/queries/Chat';
import {
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from '../../graphql/subscriptions/Chat';

const queryVariables = {
  contactOpts: {
    limit: 50,
  },
  filter: {},
  messageOpts: {
    limit: 100,
  },
};

export const CONVERSATION_MOCKS = [
  {
    request: {
      query: GET_CONVERSATION_QUERY,
      variables: queryVariables,
    },
    result: {
      data: {
        conversations: [
          {
            contact: {
              id: '2',
              name: 'Jane Doe',
              phone: '919090909009',
            },
            messages: [
              {
                id: '1',
                body: 'Hello',
                insertedAt: '2020-06-25T13:36:43Z',
                receiver: {
                  id: '1',
                },
                sender: {
                  id: '2',
                },
                tags: [
                  {
                    id: '2',
                    label: 'Important',
                  },
                ],
              },
              {
                id: '2',
                body: 'How can we help?',
                insertedAt: '2020-06-25T13:36:43Z',
                receiver: {
                  id: '2',
                },
                sender: {
                  id: '1',
                },
                tags: [
                  {
                    id: '1',
                    label: 'Unread',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },

  {
    request: {
      query: MESSAGE_RECEIVED_SUBSCRIPTION,
      variables: queryVariables,
    },
    result: {
      data: {
        receivedMessage: {
          body: 'hello',
          flow: 'INBOUND',
          id: '21',
          insertedAt: '2020-07-11T14:03:28Z',
          receiver: {
            id: '1',
            phone: '917834811114',
          },
          sender: {
            id: '2',
            phone: '919090909009',
          },
          tags: [],
          type: 'TEXT',
        },
      },
    },
  },

  {
    request: {
      query: MESSAGE_SENT_SUBSCRIPTION,
      variables: queryVariables,
    },
    result: {
      data: {
        sentMessage: {
          body: 'How can we help?',
          flow: 'OUTBOUND',
          id: '22',
          insertedAt: '2020-07-11T14:03:28Z',
          receiver: {
            id: '2',
            phone: '919090909009',
          },
          sender: {
            id: '1',
            phone: '917834811114',
          },
          tags: [],
          type: 'TEXT',
        },
      },
    },
  },
  {
    request: {
      query: GET_CONVERSATION_MESSAGE_QUERY,
      variables: { contactId: '2', filter: {}, messageOpts: { limit: 100 } },
    },
    result: {
      data: {
        conversation: {
          contact: {
            id: '2',
            name: 'Jane Doe',
            phone: '919090909009',
          },
          messages: [
            {
              id: '1',
              body: 'Hello',
              insertedAt: '2020-06-25T13:36:43Z',
              receiver: {
                id: '1',
              },
              sender: {
                id: '2',
              },
              tags: [
                {
                  id: '1',
                  label: 'Unread',
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    request: {
      query: FILTER_CONVERSATIONS_QUERY,
      variables: { term: '', messageOpts: { limit: 10 }, contactOpts: { limit: 10 } },
    },
    result: {
      data: {
        search: [
          {
            contact: {
              id: '1',
              name: 'Glific Admin',
              phone: '917834811114',
            },
            messages: [],
          },
          {
            contact: {
              id: '2',
              name: 'Glific Admin',
              phone: '917834811114',
            },
            messages: [
              {
                body: 'hindi',
                id: '5',
                insertedAt: '2020-07-17T01:37:19Z',
                receiver: {
                  id: '1',
                },
                sender: {
                  id: '2',
                },
                tags: [
                  {
                    id: '4',
                    label: 'Good Bye',
                  },
                  {
                    id: '3',
                    label: 'Compliment',
                  },
                ],
              },
              {
                body: 'english',
                id: '6',
                insertedAt: '2020-07-17T01:37:19Z',
                receiver: {
                  id: '1',
                },
                sender: {
                  id: '2',
                },
                tags: [],
              },
            ],
          },
        ],
      },
    },
  },
];
