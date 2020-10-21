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
          lastMessageAt: '2020-08-03T07:01:36Z',
          status: 'VALID',
          bspStatus: 'SESSION_AND_HSM',
        },
        messages: [
          {
            id: '34',
            body: 'Hi',
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
  searchQuery({ limit: 50, offset: 0 }, 1, { id: '6' }, true),
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
              body: null,
              contact: {
                bspStatus: 'HSM',
                id: '8',
                lastMessageAt: '2020-10-15T07:15:33Z',
                name: 'Dignesh',
                status: 'VALID',
              },
              id: '66',
              insertedAt: '2020-10-15T07:15:33.613260Z',
              media: {
                caption: null,
                url:
                  'https://filemanager.gupshup.io/fm/wamedia/demobot1/36623b99-5844-4195-b872-61ef34c9ce11',
              },
              messageNumber: 0,
              receiver: {
                id: '1',
              },
              sender: {
                id: '8',
              },
              tags: [
                {
                  colorCode: '#9900ef',
                  id: '30',
                  label: 'Default',
                },
                {
                  colorCode: '#0C976D',
                  id: '15',
                  label: 'Numeric',
                },
              ],
              type: 'IMAGE',
            },
          ],
          messages: [
            {
              body: 'Hi',
              contact: {
                bspStatus: 'HSM',
                id: '8',
                lastMessageAt: '2020-10-15T07:15:33Z',
                name: 'Dignesh',
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
    variables: { offset: 0 },
  },
  result: {
    data: {
      offset: 0,
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
