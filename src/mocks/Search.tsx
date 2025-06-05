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
import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';

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
                id: '216',
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
          id: 'group_1',
          contact: null,
          group: {
            __typename: 'Group',
            id: '1',
            label: 'Sample Collection',
          },
          messages: [],
        },
        {
          __typename: 'Conversation',
          contact: null,
          id: 'group_2',
          group: {
            __typename: 'Group',
            id: '2',
            label: 'Sample Collection 2',
          },
          messages: [],
        },
      ],
    },
  },
};

export const getContactSearchQuery = {
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: 1 },
      messageOpts: { limit: 20, offset: 0 },
      filter: { id: '3' },
    },
  },
  result: {
    data: {
      search: [
        {
          __typename: 'Conversation',
          contact: {
            __typename: 'Contact',
            bspStatus: 'SESSION_AND_HSM',
            fields: '{}',
            id: '3',
            isOrgRead: false,
            lastMessageAt: '2024-03-28T15:12:27Z',
            maskedPhone: '9876******_2',
            name: 'New Contact',
            phone: '9876543210_2',
            status: 'VALID',
          },
          group: null,
          id: 'contact_3',
          messages: [
            {
              __typename: 'Message',
              body: 'Thank you for your response',
              contextMessage: null,
              errors: null,
              flowLabel: null,
              id: '5529',
              insertedAt: '2024-03-26T16:43:54.779634Z',
              interactiveContent: '{}',
              location: null,
              media: null,
              messageNumber: 87,
              receiver: {
                __typename: 'Contact',
                id: '3',
              },
              sendBy: '',
              sender: {
                __typename: 'Contact',
                id: '1',
              },
              type: 'TEXT',
            },
          ],
        },
      ],
    },
  },
};

export const getBlockedContactSearchQuery = {
  request: {
    query: SEARCH_QUERY,
    variables: {
      contactOpts: { limit: 1 },
      messageOpts: { limit: 20, offset: 0 },
      filter: { id: '5' },
    },
  },
  result: {
    data: {
      search: [],
    },
  },
};

export const messages = (limit: number, skip: number) =>
  new Array(limit).fill(null).map((val: any, index: number) => ({
    id: `${index + skip}`,
    body: 'Hey there whats up?',
    insertedAt: `2020-${index}-25T13:36:43Z`,
    location: null,
    messageNumber: index + skip + 4,
    receiver: {
      id: '1',
    },
    sender: {
      id: '2',
    },
    type: 'TEXT',
    media: null,
    errors: '{}',
    contextMessage:
      index % 5 === 0
        ? {
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
          }
        : null,
    interactiveContent: '{}',
    sendBy: 'test',
    flowLabel: null,
  }));

export const searchQuery = {
  query: SEARCH_QUERY,
  variables: {
    filter: {},
    contactOpts: { limit: DEFAULT_ENTITY_LIMIT },
    messageOpts: { limit: DEFAULT_MESSAGE_LIMIT },
  },
  data: {
    search: [
      {
        id: 'contact_2',
        group: null,
        contact: {
          id: '2',
          name: null,
          phone: '987654321',
          maskedPhone: '98****321',
          lastMessageAt: new Date(),
          status: 'VALID',
          fields:
            '{"name":{"value":"Effie Cormier","type":"string","label":"name","inserted_at":"2024-08-12T04:40:25.098162Z"}}',
          bspStatus: 'SESSION_AND_HSM',
          isOrgRead: true,
        },
        messages: messages(20, 1),
      },
    ],
  },
};

export const searchWithDateFIlters = (from: boolean = false, to: boolean = false) => {
  let filter = {};
  if (from && !to) {
    filter = { dateRange: { from: '2025-05-01' } };
  } else if (!from && to) {
    filter = { dateRange: { to: '2025-05-06' } };
  } else if (from && to) {
    filter = { dateRange: { from: '2025-05-01', to: '2025-05-06' } };
  }

  return {
    request: {
      query: SEARCH_QUERY,
      variables: {
        contactOpts: { limit: 25 },
        messageOpts: { limit: 20 },
        filter,
      },
    },
    result: {
      data: {
        search: [
          {
            __typename: 'Conversation',
            contact: {
              __typename: 'Contact',
              bspStatus: 'SESSION_AND_HSM',
              fields:
                '{"name":{"value":"Onie Rohan","type":"string","label":"name","inserted_at":"2025-05-26T10:57:10.839210Z"},"gender":{"value":"Female","type":"string","label":"gender","inserted_at":"2025-05-26T10:57:10.839215Z"},"age":{"value":44,"type":"string","label":"age","inserted_at":"2025-05-26T10:57:10.839210Z"}}',
              id: '18',
              isOrgRead: true,
              lastMessageAt: '2025-05-26T10:57:11Z',
              maskedPhone: '589/******77',
              name: 'Onie Rohan',
              phone: '589/208-1577',
              status: 'VALID',
            },
            group: null,
            id: 'contact_18',
            messages: messages(25, 2),
          },
          {
            __typename: 'Conversation',
            contact: {
              __typename: 'Contact',
              bspStatus: 'SESSION_AND_HSM',
              fields:
                '{"name":{"value":"Nat Reichert","type":"string","label":"name","inserted_at":"2025-05-26T10:57:10.839395Z"},"gender":{"value":"Male","type":"string","label":"gender","inserted_at":"2025-05-26T10:57:10.839396Z"},"age":{"value":25,"type":"string","label":"age","inserted_at":"2025-05-26T10:57:10.839396Z"}}',
              id: '26',
              isOrgRead: false,
              lastMessageAt: '2025-05-26T10:57:11Z',
              maskedPhone: '615-******82',
              name: 'Nat Reichert',
              phone: '615-561-1682',
              status: 'VALID',
            },
            group: null,
            id: 'contact_26',
            messages: messages(25, 2),
          },
        ],
      },
    },
  };
};
