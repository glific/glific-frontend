import { savedSearchQuery } from '../../../mocks/Chat';
import { SEARCH_QUERY, SEARCH_MULTI_QUERY, SEARCH_OFFSET } from '../../../graphql/queries/Search';

const withResult = {
  data: {
    search: [
      {
        __typename: 'Conversation',
        contact: {
          id: '6',
          name: 'Red Sparrow',
          phone: '919520285543',
          maskedPhone: '919520285543',
          lastMessageAt: '2020-08-03T07:01:36Z',
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
        },
        messages: [
          {
            id: '34',
            body: 'Hi',
            location: null,
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
                parent: null,
              },
            ],
            type: 'TEXT',
            media: null,
            errors: '{}',
          },
        ],
      },
    ],
  },
};

const noResult = { data: { search: [] } };

const searchQuery = (
  messageLimit: object,
  contactLimit: number,
  filter: any,
  showResult: boolean = true
) => {
  return {
    request: {
      query: SEARCH_QUERY,
      variables: {
        filter: filter,
        messageOpts: messageLimit,
        contactOpts: { limit: contactLimit },
      },
    },
    result: showResult ? withResult : noResult,
  };
};

export const chatConversationsMocks = [
  searchQuery({ limit: 50 }, 50, {}),
  searchQuery({ limit: 50 }, 50, { term: 'a' }, false),
  searchQuery({ limit: 50 }, 50, { term: '' }),
  searchQuery({ limit: 5 }, 10, { includeTags: ['12'] }, false),
  searchQuery({ limit: 50 }, 1, {}, false),
  searchQuery({ limit: 50, offset: 0 }, 1, { id: '6' }, false),
];

export const searchMultiQuery = (term: string = '', limit: number = 50) => {
  return {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: {
        searchFilter: { term: term },
        messageOpts: { limit: limit, order: 'ASC' },
        contactOpts: { order: 'DESC', limit: limit },
      },
    },
    result: {
      data: {
        searchMulti: {
          contacts: [
            {
              bspStatus: 'SESSION_AND_HSM',
              id: '2',
              lastMessageAt: '2020-11-18T04:37:57Z',
              name: 'Default receiver',
              phone: '9876543210',
              maskedPhone: '9876543210',
              status: 'VALID',
              tags: [],
            },
            {
              bspStatus: 'SESSION',
              id: '3',
              lastMessageAt: '2020-11-18T04:37:57Z',
              name: 'Adelle Cavin',
              status: 'VALID',
              tags: [],
            },
          ],
          messages: [
            {
              body: 'Hi',
              location: null,
              contact: {
                bspStatus: 'HSM',
                id: '8',
                lastMessageAt: '2020-10-15T07:15:33Z',
                name: 'Dignesh',
                phone: '9876543210',
                maskedPhone: '9876543210',
                status: 'VALID',
              },
              id: '18',
              insertedAt: '2020-10-15T06:59:31.473314Z',
              media: null,
              messageNumber: 48,
              receiver: {
                id: '1',
              },
              sender: {
                id: '8',
              },
              tags: [
                {
                  colorCode: '#0C976D',
                  id: '4',
                  label: 'Greeting',
                },
              ],
              type: 'TEXT',
            },
          ],
          tags: [
            {
              body: 'Hi',
              contact: {
                bspStatus: 'HSM',
                id: '8',
                lastMessageAt: '2020-10-15T07:15:33Z',
                name: 'Dignesh',
                phone: '9876543210',
                maskedPhone: '9876543210',
                status: 'VALID',
              },
              id: '12',
              insertedAt: '2020-10-15T06:58:34.432894Z',
              media: null,
              messageNumber: 54,
              receiver: {
                id: '1',
              },
              sender: {
                id: '8',
              },
              tags: [
                {
                  colorCode: '#0C976D',
                  id: '4',
                  label: 'Greeting',
                },
              ],
              type: 'TEXT',
            },
          ],
        },
      },
    },
  };
};

export const searchOffset = {
  request: {
    query: SEARCH_OFFSET,
    variables: { offset: 0, search: 'hi' },
  },
  result: {
    data: {
      offset: 0,
      search: 'hi',
    },
  },
};

export const SearchConversationsMocks = [
  searchMultiQuery(),
  searchMultiQuery(),
  searchMultiQuery('a'),
];

export const ChatConversationMocks = [
  ...chatConversationsMocks,
  ...chatConversationsMocks,
  savedSearchQuery,
  ...SearchConversationsMocks,
  ...SearchConversationsMocks,
  searchOffset,
];

export const searchQueryMock = searchQuery({ limit: 50 }, 50, { term: '' });
export const searchQueryEmptyMock = searchQuery({ limit: 50 }, 50, {});
