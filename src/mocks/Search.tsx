import { CREATE_SEARCH } from 'graphql/mutations/Search';
import {
  SEARCH_LIST_QUERY,
  SEARCH_QUERY_COUNT,
  GET_SEARCH,
  SEARCH_MULTI_QUERY,
  SEARCH_QUERY,
} from 'graphql/queries/Search';
import { COLLECTION_COUNT_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';
import { MARK_AS_READ } from 'graphql/mutations/Chat';
import { conversationQuery } from './Chat';

export const createSearchQuery = {
  request: {
    query: CREATE_SEARCH,
    variables: {
      input: {
        label: 'new search description',
        shortcode: 'new search',
        args: '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeLabels":["10"]},"contactOpts":{"offset":0,"limit":20}}',
      },
    },
  },
  result: {
    data: {
      createSavedSearch: {
        errors: null,
        savedSearch: {
          args: '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeLabels":["10"]},"contactOpts":{"offset":0,"limit":20}}',
          id: '11',
          label: 'new search description',
          shortcode: 'new search',
        },
      },
    },
  },
};

export const countSearchesQuery = {
  request: {
    query: SEARCH_QUERY_COUNT,
    variables: {
      filter: {},
    },
  },
  result: {
    data: {
      countSavedSearches: 1,
    },
  },
};

const searchListQuery = (QUERY: any, filter: any, limit: number, offset: number, order: string) => {
  return {
    query: QUERY,
    variables: {
      filter,
      opts: {
        limit,
        offset,
        order,
      },
    },
  };
};

export const getSearchesQuery = [
  {
    request: searchListQuery(SEARCH_LIST_QUERY, {}, 10, 0, 'ASC'),
    result: {
      data: {
        savedSearches: [
          {
            args: '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeLabels":["10"]},"contactOpts":{"offset":0,"limit":20}}',
            id: '8',
            label: 'Test search',
            shortcode: 'Save Search',
            isReserved: false,
          },
        ],
      },
    },
  },
  {
    request: searchListQuery(SEARCH_LIST_QUERY, {}, 100, 0, 'ASC'),
    result: {
      data: {
        savedSearches: [
          {
            args: '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeLabels":["10"]},"contactOpts":{"offset":0,"limit":20}}',
            id: '8',
            label: 'Test search',
            shortcode: 'Save Search',
            isReserved: false,
          },
        ],
      },
    },
  },
  {
    request: {
      query: SEARCH_LIST_QUERY,
      variables: {
        filter: {},
        opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'shortcode' },
      },
    },
    result: {
      data: {
        savedSearches: [
          {
            args: '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeLabels":["10"]},"contactOpts":{"offset":0,"limit":20}}',
            id: '8',
            label: 'Test search',
            shortcode: 'Save Search',
            isReserved: false,
          },
        ],
      },
    },
  },
];

export const getSearch = {
  request: {
    query: GET_SEARCH,
    variables: {
      id: 1,
    },
  },
  result: {
    data: {
      savedSearch: {
        savedSearch: {
          args: '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeLabels":["10"]},"contactOpts":{"offset":0,"limit":20}}',
          id: '1',
          label: 'Test search',
          shortcode: 'Save Search collection',
          isReserved: false,
        },
      },
    },
  },
};

export const collectionCountSubscription = {
  request: {
    query: COLLECTION_COUNT_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      collectionCount: `{"collection":{"Unread":5}}`,
    },
  },
};

const contactsMock = new Array(30).fill(null).map((val: any, index: number) => ({
  id: `${index + 1}`,
  name: `Test ${index}`,
  phone: '448-917-4013',
  maskedPhone: '448-******13',
  lastMessageAt: '2021-05-03T04:56:50Z',
  status: 'VALID',
  bspStatus: 'SESSION_AND_HSM',
  isOrgRead: false,
}));

export const searchContactCollection = [
  conversationQuery,
  {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: {
        contactOpts: { limit: 25, order: 'DESC' },
        searchFilter: { term: 'III' },
        messageOpts: { limit: 20, offset: 0, order: 'ASC' },
      },
    },
    result: {
      data: {
        searchMulti: {
          contacts: [
            {
              id: '216',
              name: 'Jolie Abshire III',
              phone: '448-917-4013',
              maskedPhone: '448-******13',
              lastMessageAt: '2021-05-03T04:56:50Z',
              status: 'VALID',
              bspStatus: 'SESSION_AND_HSM',
              isOrgRead: false,
            },
            {
              id: '219',
              name: 'Mrs. Sallie Gulgowski III',
              phone: '684/339-2229',
              maskedPhone: '684/******29',
              lastMessageAt: '2021-05-03T04:56:50Z',
              status: 'VALID',
              bspStatus: 'SESSION_AND_HSM',
              isOrgRead: true,
            },
            {
              id: '163',
              name: 'Mrs. Abner Fay III',
              phone: '438.243.7969',
              maskedPhone: '438.******69',
              lastMessageAt: '2021-05-03T04:56:51Z',
              status: 'VALID',
              bspStatus: 'SESSION_AND_HSM',
              isOrgRead: false,
            },
            ...contactsMock,
          ],
          messages: [
            {
              id: '23237',
              body: 'Please check this\n',
              messageNumber: 2,
              insertedAt: '2021-05-05T05:40:02.434957Z',
              contact: {
                id: '3145',
                name: 'Test',
                phone: '+919090909090',
                maskedPhone: '9090******90',
                lastMessageAt: '2021-05-03T04:56:38Z',
                status: 'VALID',
                bspStatus: 'NONE',
              },
              receiver: {
                id: '1',
              },
              sender: {
                id: '1',
              },
              type: 'TEXT',
              media: null,
              contextMessage: null,
              flowLabel: null,
            },
          ],
          labels: [
            {
              id: '23238',
              body: 'Please check this\n',
              messageNumber: 2,
              insertedAt: '2021-05-05T05:40:02.434957Z',
              contact: {
                id: '3456',
                name: 'Test',
                phone: '+919090909090',
                maskedPhone: '9090******90',
                lastMessageAt: '2021-05-03T04:56:38Z',
                status: 'VALID',
                bspStatus: 'NONE',
              },
              receiver: {
                id: '1',
              },
              sender: {
                id: '1',
              },
              type: 'TEXT',
              media: null,
              contextMessage: null,
              flowLabel: 'III',
            },
          ],
        },
      },
    },
  },
  {
    request: {
      query: MARK_AS_READ,
      variables: { contactId: '216' },
    },
    result: {
      data: {
        markContactMessagesAsRead: '216',
      },
    },
  },
];

export const searchGroupCollection = [
  conversationQuery,
  {
    request: {
      query: SEARCH_MULTI_QUERY,
      variables: {
        contactOpts: { limit: 25, order: 'DESC' },
        searchFilter: { term: 'III' },
        messageOpts: { limit: 20, offset: 0, order: 'ASC' },
      },
    },
    result: {
      data: {
        searchMulti: {
          contacts: [
            {
              id: '216',
              name: 'Jolie Abshire III',
              phone: '448-917-4013',
              maskedPhone: '448-******13',
              lastMessageAt: '2021-05-03T04:56:50Z',
              status: 'VALID',
              bspStatus: 'SESSION_AND_HSM',
              isOrgRead: false,
            },
            {
              id: '219',
              name: 'Mrs. Sallie Gulgowski III',
              phone: '684/339-2229',
              maskedPhone: '684/******29',
              lastMessageAt: '2021-05-03T04:56:50Z',
              status: 'VALID',
              bspStatus: 'SESSION_AND_HSM',
              isOrgRead: true,
            },
            {
              id: '163',
              name: 'Mrs. Abner Fay III',
              phone: '438.243.7969',
              maskedPhone: '438.******69',
              lastMessageAt: '2021-05-03T04:56:51Z',
              status: 'VALID',
              bspStatus: 'SESSION_AND_HSM',
              isOrgRead: false,
            },
            ...contactsMock,
          ],
          messages: [
            {
              id: '23237',
              body: 'Please check this\n',
              messageNumber: 2,
              insertedAt: '2021-05-05T05:40:02.434957Z',
              contact: {
                id: '31',
                name: 'Test',
                phone: '+919090909090',
                maskedPhone: '9090******90',
                lastMessageAt: '2021-05-03T04:56:38Z',
                status: 'VALID',
                bspStatus: 'NONE',
              },
              receiver: {
                id: '1',
              },
              sender: {
                id: '1',
              },
              type: 'TEXT',
              media: null,
              contextMessage: null,
              flowLabel: null,
            },
          ],
          labels: [
            {
              id: '23238',
              body: 'Please check this\n',
              messageNumber: 2,
              insertedAt: '2021-05-05T05:40:02.434957Z',
              contact: {
                id: '34',
                name: 'Test',
                phone: '+919090909090',
                maskedPhone: '9090******90',
                lastMessageAt: '2021-05-03T04:56:38Z',
                status: 'VALID',
                bspStatus: 'NONE',
              },
              receiver: {
                id: '1',
              },
              sender: {
                id: '1',
              },
              type: 'TEXT',
              media: null,
              contextMessage: null,
              flowLabel: 'III',
            },
          ],
        },
      },
    },
  },
  {
    request: {
      query: MARK_AS_READ,
      variables: { contactId: '216' },
    },
    result: {
      data: {
        markContactMessagesAsRead: '216',
      },
    },
  },
];

export const getSearchCollectionQuery = {
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: {
        limit: 25,
      },
      filter: {
        searchGroup: true,
      },
      messageOpts: {
        limit: 20,
      },
    },
  },
  result: {
    data: {
      search: [
        {
          __typename: 'Conversation',
          contact: null,
          group: {
            __typename: 'Group',
            id: '1',
            label: 'qwe',
          },
          messages: [],
        },
        {
          __typename: 'Conversation',
          contact: null,
          group: {
            __typename: 'Group',
            id: '2',
            label: 'Sample Collection 1710520853056',
          },
          messages: [],
        },
      ],
    },
  },
};
