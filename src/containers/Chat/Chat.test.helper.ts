import {
  MESSAGE_RECEIVED_SUBSCRIPTION,
  MESSAGE_SENT_SUBSCRIPTION,
} from '../../graphql/subscriptions/Chat';
import { SAVED_SEARCH_QUERY, SEARCH_QUERY } from '../../graphql/queries/Search';
import { searchQueryMock as searchQuery } from './ChatConversations/ChatConversations.test.helper';
import { searchQueryEmptyMock as searchEmptyQuery } from './ChatConversations/ChatConversations.test.helper';
import {
  ADD_MESSAGE_TAG_SUBSCRIPTION,
  DELETE_MESSAGE_TAG_SUBSCRIPTION,
} from '../../graphql/subscriptions/Tag';
import { contactGroupsQuery } from './ChatMessages/ChatMessages.test.helper';

const queryVariables = {
  contactOpts: {
    limit: 50,
  },
  filter: {},
  messageOpts: {
    limit: 50,
  },
};

export const conversationQuery = {
  request: {
    query: SEARCH_QUERY,
    variables: queryVariables,
  },
  result: {
    data: {
      search: [
        {
          contact: {
            id: '2',
            name: 'Jane Doe',
            phone: '919090909009',
            lastMessageAt: '2020-06-25T13:36:43Z',
            status: 'VALID',
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
                  colorCode: '#00d084',
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
                  colorCode: '#00d084',
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
          id: '2',
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

const addMessageTagSubscription = {
  request: {
    query: ADD_MESSAGE_TAG_SUBSCRIPTION,
    variables: queryVariables,
  },
  result: {
    data: {
      createdMessageTag: {
        message: {
          flow: 'OUTBOUND',
          id: '22',
          receiver: {
            id: '2',
          },
          sender: {
            id: '1',
          },
        },
        tag: { id: 1, label: 'Greeting', colorCode: '#00d084' },
      },
    },
  },
};

const deleteMessageTagSubscription = {
  request: {
    query: DELETE_MESSAGE_TAG_SUBSCRIPTION,
    variables: queryVariables,
  },
  result: {
    data: {
      deletedMessageTag: {
        message: {
          flow: 'OUTBOUND',
          id: '22',
          receiver: {
            id: '2',
          },
          sender: {
            id: '1',
          },
        },
        tag: { id: 1, label: 'Greeting', colorCode: '#00d084' },
      },
    },
  },
};

const conversationMessageQuery = (contactId: any, contactName: string, contactNumber: string) => ({
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: {
        limit: 50,
      },
      filter: { id: contactId.toString() },
      messageOpts: { limit: 50 },
    },
  },
  result: {
    data: {
      search: [
        {
          contact: {
            id: contactId.toString(),
            name: contactName,
            phone: contactNumber,
            lastMessageAt: '2020-06-25T13:36:43Z',
            status: 'VALID',
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
                  colorCode: '#00d084',
                },
              ],
            },
          ],
        },
      ],
    },
  },
});

const savedSearchQuery = {
  request: {
    query: SAVED_SEARCH_QUERY,
    variables: { filter: {}, opts: { limit: 10 } },
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
  contactGroupsQuery,
  searchQuery,
  searchEmptyQuery,
  conversationQuery,
  messageReceivedSubscription,
  messageSendSubscription,
  addMessageTagSubscription,
  deleteMessageTagSubscription,
  savedSearchQuery,
  conversationMessageQuery('2', 'Jane Doe', '919090909009'),
  conversationMessageQuery('3', 'Jane Monroe', '919090709009'),
];
