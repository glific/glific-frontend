import { mocks as SAVED_SEARCH_MOCK } from '../../SavedSearch/SavedSearchToolbar/SavedSearchToolbar.test';
import { SEARCH_QUERY } from '../../../graphql/queries/Search';
import { conversationQuery } from '../Chat.test.helper';

const searchQuery = (messageLimit: number, contactLimit: number, filter: any) => {
  return {
    request: {
      query: SEARCH_QUERY,
      variables: {
        filter: filter,
        messageOpts: { limit: messageLimit },
        contactOpts: { limit: contactLimit },
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
              lastMessageAt: '2020-08-03T07:01:36Z',
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
                  id: '6',
                },
                tags: [
                  {
                    id: '8',
                    label: 'Not working',
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
};
export const chatConversationsMocks = [
  {
    request: {
      query: SEARCH_QUERY,
      variables: { contactOpts: { limit: 25 }, filter: { id: '2' }, messageOpts: { limit: 25 } },
    },
    result: {
      data: {
        conversation: {
          contact: {
            id: '2',
            name: 'Jane Doe',
            phone: '919520285543',
            lastMessageAt: '2020-08-03T07:01:36Z',
          },
          messages: [
            {
              id: '1',
              body: 'Hey there whats up?',
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
                  label: 'important',
                  colorCode: '#00d084',
                },
              ],
            },
          ],
        },
      },
    },
  },
  searchQuery(50, 50, {}),
  searchQuery(50, 50, { term: 'a' }),
  searchQuery(50, 50, { term: '' }),
  searchQuery(5, 10, { includeTags: ['12'] }),
  searchQuery(5, 10, { term: '', includeTags: ['12'] }),
];

export const searchQueryMock = searchQuery(50, 50, { term: '' });
export const searchQueryEmptyMock = searchQuery(50, 50, {});

export const conversations = [
  {
    contact: {
      id: '6',
      name: 'Red Eye',
      phone: '919520225543',
      lastMessageAt: '2020-08-03T07:01:36Z',
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
            colorCode: '#00d084',
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
