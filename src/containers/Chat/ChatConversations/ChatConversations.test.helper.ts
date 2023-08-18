import { collectionCountQuery, conversationMessageQuery, savedSearchStatusQuery } from 'mocks/Chat';
import { SEARCH_QUERY, SEARCH_MULTI_QUERY, SEARCH_OFFSET } from 'graphql/queries/Search';
import { DEFAULT_CONTACT_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import { collectionCountSubscription } from 'mocks/Search';
import { getCollectionsQuery } from 'mocks/Collection';
import { getUsersQuery } from 'mocks/User';
import { getAllFlowLabelsQuery } from 'mocks/Flow';

const withResult = {
  data: {
    search: [
      {
        __typename: 'Conversation',
        group: null,
        contact: {
          id: '6',
          fields: '{}',
          isOrgRead: false,
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
            messageNumber: 1,
            sendBy: null,
            location: null,
            insertedAt: '2020-08-03T07:01:36Z',
            receiver: {
              id: '2',
            },
            sender: {
              id: '6',
            },
            type: 'TEXT',
            media: null,
            errors: '{}',
            contextMessage: {
              body: 'All good',
              contextId: 1,
              messageNumber: 10,
              errors: '{}',
              media: null,
              type: 'TEXT',
              insertedAt: '2021-04-26T06:13:03.832721Z',
              location: null,
              receiver: {
                id: '1',
              },
              sender: {
                id: '2',
                name: 'User',
              },
            },
            interactiveContent: '{}',
            flowLabel: null,
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
  showResult: boolean = true,
) => {
  return {
    request: {
      query: SEARCH_QUERY,
      variables: {
        filter,
        messageOpts: messageLimit,
        contactOpts: { limit: contactLimit },
      },
    },
    result: showResult ? withResult : noResult,
  };
};

export const chatConversationsMocks = [
  searchQuery({ limit: DEFAULT_MESSAGE_LIMIT }, DEFAULT_CONTACT_LIMIT, {}),
  searchQuery({ limit: DEFAULT_MESSAGE_LIMIT }, DEFAULT_CONTACT_LIMIT, { term: 'a' }, false),
  searchQuery({ limit: DEFAULT_MESSAGE_LIMIT }, DEFAULT_CONTACT_LIMIT, { term: '' }),
  searchQuery(
    { limit: DEFAULT_CONTACT_LIMIT },
    DEFAULT_MESSAGE_LIMIT,
    { includeTags: ['12'] },
    false,
  ),
  searchQuery({ limit: DEFAULT_MESSAGE_LIMIT }, 1, {}, false),
  searchQuery({ limit: DEFAULT_MESSAGE_LIMIT, offset: 0 }, 1, { id: '6' }, false),
];

export const searchMultiQuery = (
  term: string = '',
  contactLimit: number = DEFAULT_CONTACT_LIMIT,
  messageLimit: number = DEFAULT_MESSAGE_LIMIT,
) => {
  return {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: {
        contactOpts: { order: 'DESC', limit: contactLimit },
        searchFilter: { term },
        messageOpts: { limit: messageLimit, offset: 0, order: 'ASC' },
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
              isOrgRead: false,
              phone: '9876543210',
              maskedPhone: '9876**3210',
              status: 'VALID',
            },
            {
              bspStatus: 'SESSION',
              id: '3',
              isOrgRead: false,
              phone: '9876543211',
              maskedPhone: '9876**3211',
              lastMessageAt: '2020-11-18T04:37:57Z',
              name: 'Adelle Cavin',
              status: 'VALID',
            },
          ],
          messages: [
            {
              contextMessage: null,
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
              type: 'TEXT',
              flowLabel: null,
            },
          ],
          labels: [],
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

export const searchQueryForSavedSearch = {
  request: {
    query: SEARCH_QUERY,
    variables: {
      messageOpts: { limit: 1 },
      filter: { includeLabels: ['12'] },
      contactOpts: { limit: 1 },
    },
  },
  result: {
    data: {
      search: [
        {
          group: null,
          contact: {
            id: '2',
            name: 'Glific user',
            phone: '919876543210',
            maskedPhone: '91987**43210',
            lastMessageAt: '2020-06-25T13:36:43Z',
            status: 'VALID',
            bspStatus: 'SESSION_AND_HSM',
            isOrgRead: true,
            fields: '{}',
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
              type: 'TEXT',
              media: null,
              location: null,
              errors: null,
              messageNumber: 2,
              contextMessage: {
                body: 'All good',
                contextId: 1,
                messageNumber: 10,
                errors: '{}',
                media: null,
                type: 'TEXT',
                insertedAt: '2021-04-26T06:13:03.832721Z',
                location: null,
                receiver: {
                  id: '1',
                },
                sender: {
                  id: '2',
                  name: 'User',
                },
              },
              sendBy: 'Glific User',
              interactiveContent: '{}',
              flowLabel: null,
            },
          ],
        },
      ],
    },
  },
};

export const ChatConversationMocks = [
  collectionCountSubscription,
  collectionCountQuery,
  ...getCollectionsQuery,
  getUsersQuery,
  getAllFlowLabelsQuery,
  ...chatConversationsMocks,
  ...chatConversationsMocks,
  savedSearchStatusQuery,
  ...SearchConversationsMocks,
  ...SearchConversationsMocks,
  searchOffset,
  searchQueryForSavedSearch,
];

export const searchQueryMock = searchQuery(
  { limit: DEFAULT_CONTACT_LIMIT },
  DEFAULT_MESSAGE_LIMIT,
  { term: '' },
);
export const searchQueryEmptyMock = searchQuery(
  { limit: DEFAULT_CONTACT_LIMIT },
  DEFAULT_MESSAGE_LIMIT,
  {},
);
