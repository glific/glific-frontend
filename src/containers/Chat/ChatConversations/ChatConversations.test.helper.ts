import { GET_CONVERSATION_MESSAGE_QUERY } from '../../../graphql/queries/Chat';
import { mocks as SAVED_SEARCH_MOCK } from '../../SavedSearch/SavedSearchToolbar/SavedSearchToolbar.test';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import { conversationQuery } from '../Chat.test.helper';

const searchQuery = (term: any, messageLimit: number, contactLimit: number, filter: any) => {
  return {
    request: {
      query: SEARCH_QUERY,
      variables: {
        term: term,
        messageOpts: { limit: messageLimit },
        contactOpts: { limit: contactLimit },
        filter,
      },
    },
    result: {
      data: {
        search: [
          {
            contact: {
              id: '6',
              name: 'Red Sparrow',
              phone: '919520285543',
            },
            messages: [
              {
                body: 'Hi',
                id: '34',
                insertedAt: '2020-08-03T07:01:36Z',
                receiver: {
                  id: '2',
                },
                sender: {
                  id: '1',
                },
                tags: [
                  {
                    id: '8',
                    label: 'Not working',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  };
};
const chatConversationsMocks = [
  {
    request: {
      query: GET_CONVERSATION_MESSAGE_QUERY,
      variables: { contactId: '2', filter: {}, messageOpts: { limit: 25 } },
    },
    result: {
      data: {
        conversation: {
          contact: {
            id: '2',
            name: 'Jane Doe',
          },
          messages: [
            {
              id: '1',
              body: 'Hey there whats up?',
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
                  label: 'important',
                },
              ],
            },
          ],
        },
      },
    },
  },
  searchQuery('a', 50, 50, {}),
  searchQuery('', 50, 50, {}),
  searchQuery('', 5, 10, { includeTags: ['12'] }),
];

export const conversations = [
  {
    contact: {
      id: '6',
      name: 'Red Eye',
      phone: '919520225543',
    },
    messages: [
      {
        id: '34',
        body: 'Hi',
        insertedAt: '2020-08-03T07:01:36Z',
        receiver: {
          id: '1',
        },
        sender: {
          id: '6',
        },
        tags: [
          {
            id: '8',
            label: 'Not replied',
          },
        ],
      },
    ],
  },
];

export const ChatConversationMocks = [
  ...chatConversationsMocks,
  ...chatConversationsMocks,
  ...SAVED_SEARCH_MOCK,
  conversationQuery,
];
