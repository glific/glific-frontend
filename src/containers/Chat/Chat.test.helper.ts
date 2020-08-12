import { GET_CONVERSATION_QUERY, GET_CONVERSATION_MESSAGE_QUERY } from '../../graphql/queries/Chat';
import {
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from '../../graphql/subscriptions/Chat';
import { SAVED_SEARCH_QUERY } from '../../graphql/queries/Search';
import { searchQueryMock as searchQuery } from './ChatConversations/ChatConversations.test.helper';

const queryVariables = {
  contactOpts: {
    limit: 50,
  },
  filter: {},
  messageOpts: {
    limit: 100,
  },
};

export const conversationQuery = {
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
};

const messageReceivedSubscription = {
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
          id: '3',
          phone: '919090709009',
        },
        tags: [],
        type: 'TEXT',
      },
    },
  },
};

const messageSendSubscription = {
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
};

const conversationMessageQuery = (contactId: any, contactName: string, contactNumber: string) => ({
  request: {
    query: GET_CONVERSATION_MESSAGE_QUERY,
    variables: { contactId: contactId, filter: {}, messageOpts: { limit: 100 } },
  },
  result: {
    data: {
      conversation: {
        contact: {
          id: contactId,
          name: contactName,
          phone: contactNumber,
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
              id: '3',
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
});

const savedSearchQuery = {
  request: {
    query: SAVED_SEARCH_QUERY,
    variables: { filter: {}, opts: { limit: 3 } },
  },
  result: {
    data: {
      savedSearches: [
        {
          args:
            '{"messageOpts":{"limit":5},"filter":{"includeTags":["12"]},"contactOpts":{"limit":10}}',
          id: '1',
          label: 'All unread conversations',
          shortcode: 'Unread',
          count: 10,
        },
      ],
    },
  },
};

export const CONVERSATION_MOCKS = [
  conversationQuery,
  searchQuery,
  conversationQuery,
  messageReceivedSubscription,
  messageSendSubscription,
  savedSearchQuery,
  conversationMessageQuery('2', 'Jane Doe', '919090909009'),
  conversationMessageQuery('3', 'Jane Monroe', '919090709009'),
];

const messageReceivedSubscriptionWithNoData = {
  request: {
    query: MESSAGE_RECEIVED_SUBSCRIPTION,
    variables: queryVariables,
  },
  result: {
    data: null,
  },
};
export const CONVERSATION_MOCKS_WITH_NO_DATA = [
  conversationQuery,
  conversationQuery,
  messageSendSubscription,
  searchQuery,
  savedSearchQuery,
  messageReceivedSubscriptionWithNoData,
  conversationMessageQuery('2', 'Jane Doe', '919090909009'),
];
