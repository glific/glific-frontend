import { savedSearchQuery } from '../../../mocks/Chat';
import { SEARCH_QUERY, SEARCH_MULTI_QUERY } from '../../../graphql/queries/Search';

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
  messageLimit: number,
  contactLimit: number,
  filter: any,
  showResult: boolean = true
) => {
  return {
    request: {
      query: SEARCH_QUERY,
      variables: {
        filter: filter,
        messageOpts: { limit: messageLimit },
        contactOpts: { limit: contactLimit },
      },
    },
    result: showResult ? withResult : noResult,
  };
};

export const chatConversationsMocks = [
  searchQuery(50, 50, {}),
  searchQuery(50, 50, { term: 'a' }, false),
  searchQuery(50, 50, { term: '' }),
  searchQuery(5, 10, { includeTags: ['12'] }, false),
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
              body: 'hola',
              contact: {
                name: 'Default receiver',
              },
              id: '7',
            },
          ],
          messages: [
            {
              body: 'Default message body',
              bspStatus: 'ENQUEUED',
              contact: {
                name: 'Default receiver',
                status: 'VALID',
              },
              sendAt: null,
            },
          ],
          tags: [],
        },
      },
    },
  };
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
];

export const searchQueryMock = searchQuery(50, 50, { term: '' });
export const searchQueryEmptyMock = searchQuery(50, 50, {});
