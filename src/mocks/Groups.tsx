import {
  DEFAULT_ENTITY_LIMIT,
  DEFAULT_MESSAGE_LIMIT,
  GROUP_COLLECTION_SEARCH_QUERY_VARIABLES,
  setVariables,
} from 'common/constants';
import {
  UPDATE_COLLECTION_WA_GROUP,
  UPDATE_WA_GROUP_COLLECTION,
} from 'graphql/mutations/Collection';
import { SYNC_GROUPS, UPDATE_GROUP_CONTACT } from 'graphql/mutations/Group';
import { GET_COLLECTION, GROUP_GET_COLLECTION } from 'graphql/queries/Collection';
import {
  COUNT_COUNTACTS_WA_GROUPS,
  GET_GROUP_COUNT,
  GET_WA_GROUPS,
  GET_WA_MANAGED_PHONES,
  GROUP_SEARCH_MULTI_QUERY,
  GROUP_SEARCH_QUERY,
  LIST_CONTACTS_WA_GROUPS,
} from 'graphql/queries/WaGroups';
import {
  SENT_MESSAGE_WA_GROUP_COLLECTION,
  WA_MESSAGE_RECEIVED_SUBSCRIPTION,
  WA_MESSAGE_SENT_SUBSCRIPTION,
} from 'graphql/subscriptions/Groups';

export const waGroup = {
  query: GROUP_SEARCH_QUERY,
  variables: {
    waMessageOpts: {
      limit: DEFAULT_MESSAGE_LIMIT,
    },
    waGroupOpts: {
      limit: DEFAULT_ENTITY_LIMIT,
    },
    filter: {},
  },
  data: {
    search: [
      {
        id: 'wa_group_2',
        group: null,
        waGroup: {
          __typename: 'WaGroup',
          bspId: '745572428506626346@g.us',
          id: '2',
          label: 'Oklahoma sheep',
          lastCommunicationAt: '2024-03-12T14:12:30Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '1',
            label: null,
            phone: '8238389740',
            phoneId: 8220,
          },
        },
        messages: [
          {
            __typename: 'WaMessage',
            body: 'hey',
            contact: {
              __typename: 'Contact',
              name: 'default reciever',
            },
            contextMessage: null,
            errors: null,
            id: '11',
            insertedAt: '2024-03-11T12:49:44.406045Z',
            media: null,
            messageNumber: 4,
            status: 'sent',
            type: 'TEXT',
          },
          {
            __typename: 'WaMessage',
            body: 'hi',
            contact: {
              __typename: 'Contact',
              name: 'test',
            },
            contextMessage: null,
            errors: null,
            id: '10',
            insertedAt: '2024-03-11T12:49:39.915883Z',
            media: null,
            messageNumber: 3,
            status: 'sent',
            type: 'TEXT',
          },
        ],
      },
      {
        id: 'wa_group_1',
        group: null,
        waGroup: {
          __typename: 'WaGroup',
          bspId: '120363236785156570@g.us',
          id: '1',
          label: 'WA Group 18',
          lastCommunicationAt: '2024-03-11T23:28:45Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '3',
            label: null,
            phone: '918657048983',
            phoneId: 43876,
          },
        },
        messages: [],
      },
    ],
  },
};

const sampleMessage = {
  __typename: 'WaMessage',
  body: 'I will speak daggers to her, but use none.',
  contact: {
    __typename: 'Contact',
    name: 'Default receiver',
  },
  contextMessage: null,
  errors: null,
  id: '1',
  insertedAt: '2024-03-11T04:39:56.772383Z',
  media: null,
  messageNumber: 1,
  status: 'received',
  type: 'TEXT',
};

const sampleSearchQueryResult = [
  {
    id: 'wa_group_1',
    __typename: 'WaConversation',
    group: null,
    messages: [sampleMessage],
    waGroup: {
      __typename: 'WaGroup',
      bspId: '745572428506626346@g.us',
      id: '1',
      label: 'Oklahoma sheep',
      lastCommunicationAt: '2024-03-12T14:12:30Z',
      waManagedPhone: {
        __typename: 'WaManagedPhone',
        id: '1',
        label: null,
        phone: '8238389740',
        phoneId: 8220,
      },
    },
  },
];

export const waGroupcollection = {
  query: GROUP_SEARCH_QUERY,
  variables: GROUP_COLLECTION_SEARCH_QUERY_VARIABLES,
  data: {
    search: [
      {
        group: {
          id: '1',
          label: 'Default WA Group Collection',
        },
        id: 'group_1',
        messages: [sampleMessage],
        waGroup: null,
      },
      {
        group: {
          id: '1',
          label: 'Sample Group Collection 1710521137960',
        },
        id: 'group_2',
        messages: [],
        waGroup: null,
      },
    ],
  },
};

export const searchGroupQuery = [
  {
    request: {
      query: GROUP_SEARCH_QUERY,
      variables: {
        waGroupOpts: {
          limit: 25,
        },
        filter: {},
        waMessageOpts: {
          limit: 20,
        },
      },
    },
    result: {
      data: {
        search: sampleSearchQueryResult,
      },
    },
  },
  {
    request: {
      query: GROUP_SEARCH_MULTI_QUERY,
      variables: {
        waGroupOpts: {
          limit: 25,
          order: 'DESC',
        },
        filter: {
          term: 'group 2',
        },
        waMessageOpts: {
          limit: 20,
          offset: 0,
          order: 'ASC',
        },
      },
    },
    result: {
      data: {
        searchMulti: {
          __typename: 'WaSearchCup',
          groups: [
            {
              __typename: 'WaGroup',
              bspId: '120363237455656800@g.us',
              id: '7',
              lastCommunicationAt: '2024-03-11T16:12:30Z',
              name: 'Group 20',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363254172504067@g.us',
              id: '6',
              lastCommunicationAt: '2024-03-11T14:12:55Z',
              name: 'Group 21',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363255262416308@g.us',
              id: '4',
              lastCommunicationAt: '2024-03-11T11:12:30Z',
              name: 'group 23',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363234394142194@g.us',
              id: '26',
              lastCommunicationAt: '2024-03-11T07:12:30Z',
              name: 'Group 2',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363253669863953@g.us',
              id: '5',
              lastCommunicationAt: '2024-03-08T14:12:30Z',
              name: 'Group 22',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363239032352108@g.us',
              id: '3',
              lastCommunicationAt: '2024-03-02T14:12:30Z',
              name: 'group 24',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
          ],
          messages: [],
        },
      },
    },
  },
  {
    request: {
      query: GROUP_SEARCH_QUERY,
      variables: {
        waGroupOpts: {
          limit: 25,
        },
        filter: {
          waPhoneIds: ['1'],
        },
        waMessageOpts: {
          limit: 20,
        },
      },
    },
    result: {
      data: {
        search: sampleSearchQueryResult,
      },
    },
  },
  {
    request: {
      query: GROUP_SEARCH_QUERY,
      variables: {
        waGroupOpts: {
          limit: 25,
        },
        filter: {
          searchGroup: true,
        },
        waMessageOpts: {
          limit: 20,
        },
      },
    },
    result: {
      data: {
        search: [
          {
            id: 'group_7',
            group: {
              __typename: 'Group',
              id: '7',
              label: 'Whatsapp Group Collection 1',
            },
            messages: [],
            waGroup: null,
          },
          {
            id: 'group_8',
            group: {
              __typename: 'Group',
              id: '8',
              label: 'Whatsapp Group Collection 2',
            },
            messages: [],
            waGroup: null,
          },
          {
            id: 'group_6',
            group: {
              __typename: 'Group',
              id: '6',
              label: 'Default WA Group Collection',
            },
            messages: [],
            waGroup: null,
          },
        ],
      },
    },
  },
];

export const searchCollectionGroupQuery = [
  {
    request: {
      query: GROUP_SEARCH_QUERY,
      variables: {
        waGroupOpts: { limit: 25 },
        filter: { searchGroup: true },
        waMessageOpts: { limit: 20 },
      },
    },
    result: {
      data: {
        search: [
          {
            id: 'group_1',
            group: {
              id: '1',
              label: 'Default WA Group Collection',
            },
            messages: [],
            waGroup: null,
          },
          {
            id: 'group_2',
            group: {
              id: '2',
              label: 'Sample Group Collection ',
            },
            messages: [],
            waGroup: null,
          },
        ],
      },
    },
  },
  {
    request: {
      query: GROUP_SEARCH_MULTI_QUERY,
      variables: {
        waGroupOpts: {
          limit: 25,
          order: 'DESC',
        },
        filter: {
          term: 'group 2',
        },
        waMessageOpts: {
          limit: 20,
          offset: 0,
          order: 'ASC',
        },
      },
    },
    result: {
      data: {
        searchMulti: {
          __typename: 'WaSearchCup',
          groups: [
            {
              __typename: 'WaGroup',
              bspId: '120363237455656800@g.us',
              id: '7',
              lastCommunicationAt: '2024-03-11T16:12:30Z',
              name: 'Group 20',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363254172504067@g.us',
              id: '6',
              lastCommunicationAt: '2024-03-11T14:12:55Z',
              name: 'Group 21',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363255262416308@g.us',
              id: '4',
              lastCommunicationAt: '2024-03-11T11:12:30Z',
              name: 'group 23',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363234394142194@g.us',
              id: '26',
              lastCommunicationAt: '2024-03-11T07:12:30Z',
              name: 'Group 2',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363253669863953@g.us',
              id: '5',
              lastCommunicationAt: '2024-03-08T14:12:30Z',
              name: 'Group 22',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
            {
              __typename: 'WaGroup',
              bspId: '120363239032352108@g.us',
              id: '3',
              lastCommunicationAt: '2024-03-02T14:12:30Z',
              name: 'group 24',
              waManagedPhone: {
                __typename: 'WaManagedPhone',
                id: '3',
                label: null,
                phone: '918657048983',
                phoneId: 43876,
              },
            },
          ],
          messages: [],
        },
      },
    },
  },
  {
    request: {
      query: GROUP_SEARCH_QUERY,
      variables: {
        waGroupOpts: {
          limit: 25,
        },
        filter: {
          waPhoneIds: ['1'],
        },
        waMessageOpts: {
          limit: 20,
        },
      },
    },
    result: {
      data: {
        search: sampleSearchQueryResult,
      },
    },
  },
  {
    request: {
      query: GROUP_SEARCH_QUERY,
      variables: {
        waGroupOpts: {
          limit: 25,
        },
        filter: {
          searchGroup: true,
        },
        waMessageOpts: {
          limit: 20,
        },
      },
    },
    result: {
      data: {
        search: [
          {
            id: 'group_7',
            __typename: 'WaConversation',
            group: {
              __typename: 'Group',
              id: '7',
              label: 'Whatsapp Group Collection 1',
            },
            messages: [],
            waGroup: null,
          },
          {
            __typename: 'WaConversation',
            id: 'group_8',
            group: {
              __typename: 'Group',
              id: '8',
              label: 'Whatsapp Group Collection 2',
            },
            messages: [],
            waGroup: null,
          },
          {
            __typename: 'WaConversation',
            id: 'group_6',
            group: {
              __typename: 'Group',
              id: '6',
              label: 'Default WA Group Collection',
            },
            messages: [],
            waGroup: null,
          },
        ],
      },
    },
  },
];

const groupsData = {
  waGroups: [
    {
      bspId: '120363242907663820@g.us',
      id: '1',
      lastCommunicationAt: '2024-03-15T10:53:48Z',
      name: 'Group test 1',
    },
    {
      bspId: '120363242907663810@g.us',
      id: '5',
      lastCommunicationAt: '2024-03-15T10:53:48Z',
      name: 'Group 1',
    },
  ],
};

export const getGroupsSearchQuery = {
  request: {
    query: GET_WA_GROUPS,
    variables: setVariables({}, 50),
  },
  result: {
    data: groupsData,
  },
};

export const getGroupsSearchQuery2 = {
  request: {
    query: GET_WA_GROUPS,
    variables: setVariables({ label: '' }, 50),
  },
  result: {
    data: groupsData,
  },
};

export const getGroupsQuery = {
  request: {
    query: GET_WA_GROUPS,
    variables: setVariables({ name: '' }, 50, 0, 'ASC'),
  },
  result: {
    data: {
      waGroups: [
        {
          bspId: '120363242907663810@g.us',
          id: '1',
          lastCommunicationAt: '2024-03-15T10:53:48Z',
          name: 'Group 1',
        },
        {
          bspId: '120363242907663810@g.us',
          id: '2',
          lastCommunicationAt: '2024-03-15T10:53:48Z',
          name: 'Group 2',
        },
        {
          bspId: '120363242907663810@g.us',
          id: '3',
          lastCommunicationAt: '2024-03-15T10:53:48Z',
          name: 'Group 3',
        },
      ],
    },
  },
};

export const updateCollectionWaGroupQuery = {
  request: {
    query: UPDATE_COLLECTION_WA_GROUP,
    variables: { input: { addWaGroupIds: ['5'], groupId: '1', deleteWaGroupIds: [] } },
  },
  result: {
    data: {
      updateCollectionWaGroup: {
        __typename: 'CollectionWaGroupResult',
        groupContacts: [
          {
            __typename: 'WaGroupsCollection',
            id: '5',
          },
        ],
        numberDeleted: 0,
      },
    },
  },
};

export const waManagedPhonesQuery = {
  request: {
    query: GET_WA_MANAGED_PHONES,
    variables: {
      filter: {},
    },
  },
  response: {
    waManagedPhones: [
      {
        __typename: 'WaManagedPhone',
        id: '1',
        label: null,
        phone: '7535988655',
      },
      {
        __typename: 'WaManagedPhone',
        id: '2',
        label: null,
        phone: '411395483',
      },
      {
        __typename: 'WaManagedPhone',
        id: '3',
        label: null,
        phone: '2666135435',
      },
    ],
  },
};

export const syncWaGroupContactsQuery = {
  request: {
    query: SYNC_GROUPS,
  },
  result: {
    data: {
      syncWaGroupContacts: {
        __typename: 'SyncWaContacts',
        message: 'successfully synced',
      },
    },
  },
};

export const syncWaGroupContactsQueryWithError = {
  request: {
    query: SYNC_GROUPS,
  },
  result: {
    data: {
      syncWaGroupContacts: null,
    },
    errors: [
      {
        message: 'some error',
        path: ['syncWaGroupContacts'],
        locations: [
          {
            line: 2,
            column: 3,
          },
        ],
      },
    ],
  },
};

export const waMessageReceivedSubscription = {
  request: {
    query: WA_MESSAGE_RECEIVED_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      receivedWaGroupMessage: {
        __typename: 'WaMessage',
        body: 'hi',
        contact: {
          __typename: 'Contact',
          name: 'akansha',
        },
        contextMessage: null,
        errors: null,
        flow: 'INBOUND',
        id: '27',
        insertedAt: '2024-03-16T18:10:40.990907Z',
        media: null,
        messageNumber: 2,
        status: 'received',
        type: 'TEXT',
        waGroup: {
          __typename: 'WaGroup',
          id: '1',
        },
      },
    },
  },
};

export const waMessageSendSubscription = {
  request: {
    query: WA_MESSAGE_SENT_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      sentWaGroupMessage: {
        __typename: 'WaMessage',
        body: 'hi',
        contact: {
          __typename: 'Contact',
          name: null,
        },
        contextMessage: null,
        errors: null,
        flow: 'INBOUND',
        id: '28',
        insertedAt: '2024-03-16T18:11:46.277657Z',
        media: null,
        messageNumber: 3,
        status: 'enqueued',
        type: 'TEXT',
        waGroup: {
          __typename: 'WaGroup',
          id: '1',
        },
      },
    },
  },
};

export const waSentMessageCollectionQuery = {
  request: {
    query: SENT_MESSAGE_WA_GROUP_COLLECTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      sentWaGroupCollectionMessage: {
        id: '1',
        body: 'hi',
        flow: 'INBOUND',
        type: 'TEXT',
        messageNumber: 1,
        insertedAt: '2024-03-16T18:12:34.735467Z',
        groupId: '1',
        media: null,
        errors: null,
        status: 'sent',
        contact: null,
        contextMessage: null,
        waGroup: null,
      },
    },
  },
};

export const GROUP_CONVERSATION_MOCKS = [
  ...searchGroupQuery,
  waMessageSendSubscription,
  waMessageReceivedSubscription,
  waSentMessageCollectionQuery,
];

const groups = Array(30)
  .fill(null)
  .map((val: any, index: number) => ({
    label: `Group ${index + 1}`,
  }));

export const waGroupContacts = {
  request: {
    query: LIST_CONTACTS_WA_GROUPS,
    variables: {
      filter: {
        waGroupId: '1',
      },
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
        orderWith: undefined,
      },
    },
  },
  result: {
    data: {
      waGroupContact: [
        {
          contact: {
            id: '18',
            name: 'User 1',
            phone: '918416933261',
            waGroups: groups,
          },
          id: '792',
          isAdmin: false,
          waGroup: {
            id: '20',
            label: 'Group 12',
            waManagedPhone: {
              phone: '918657048983',
            },
          },
        },
        {
          contact: {
            id: '16',
            name: null,
            phone: '918657048983',
            waGroups: [
              {
                label: 'Maytapi Testing',
              },
              {
                label: 'Random2',
              },
            ],
          },
          id: '793',
          isAdmin: true,
          waGroup: {
            __typename: 'WaGroup',
            id: '20',
            label: 'Group 12',
            waManagedPhone: {
              __typename: 'WaManagedPhone',
              phone: '918657048983',
            },
          },
        },
      ],
    },
  },
};

export const countWaGroupContacts = {
  request: {
    query: COUNT_COUNTACTS_WA_GROUPS,
    variables: { filter: { waGroupId: '1' } },
  },
  result: {
    data: {
      countWaGroupContact: 2,
    },
  },
};

export const removeContactQuery = {
  request: {
    query: UPDATE_GROUP_CONTACT,
    variables: {
      input: { addWaContactIds: [], deleteWaContactIds: ['18'], waGroupId: '1' },
    },
  },
  result: {
    data: {
      updateContactWaGroups: {
        numberDeleted: 1,
        waGroupContacts: [],
      },
    },
  },
};

export const addGroupToCollectionList = {
  request: {
    query: UPDATE_COLLECTION_WA_GROUP,
    variables: {
      input: {
        addWaGroupIds: ['5'],
        groupId: '1',
        deleteWaGroupIds: [],
      },
    },
  },
  result: {
    data: {
      updateCollectionWaGroup: {
        groupContacts: [
          {
            id: '17',
          },
        ],
        numberDeleted: 0,
      },
    },
  },
};

export const countGroups = {
  request: {
    query: GET_GROUP_COUNT,
    variables: { filter: { includeGroups: '1' } },
  },
  result: { data: { countWaGroups: 5 } },
};

export const getGroups = {
  request: {
    query: GROUP_GET_COLLECTION,
    variables: {
      filter: { includeGroups: '1' },
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'label' },
    },
  },
  result: {
    data: {
      waGroups: [
        {
          bspId: '120363255034755395@g.us',
          id: '19',
          label: 'Group 12',
          lastCommunicationAt: '2024-03-14T05:31:46Z',
        },
        {
          bspId: '120363254553139323@g.us',
          id: '24',
          label: 'Group 7',
          lastCommunicationAt: '2024-03-14T03:57:42Z',
        },
        {
          bspId: '120363255430686472@g.us',
          id: '23',
          label: 'Group 8',
          lastCommunicationAt: '2024-03-14T03:57:42Z',
        },
        {
          bspId: '493920286032891462@g.us',
          id: '1',
          label: 'Indiana foes',
          lastCommunicationAt: '2024-03-14T03:55:33Z',
        },
        {
          bspId: '112887777270950553@g.us',
          id: '3',
          label: 'Oklahoma banshees',
          lastCommunicationAt: '2024-03-14T04:55:24Z',
        },
      ],
    },
  },
};

export const getGroupsCollections = {
  request: {
    query: GET_COLLECTION,
    variables: { id: '1' },
  },
  result: {
    data: {
      group: {
        __typename: 'GroupResult',
        group: {
          __typename: 'Group',
          description: null,
          id: '2',
          label: 'Default WA Group Collection',
          roles: [],
          users: [],
        },
      },
    },
  },
};

export const updateWaGroupCollection = {
  request: {
    query: UPDATE_WA_GROUP_COLLECTION,
    variables: {},
  },
  result: {},
};

export const searchFilterQuery = {
  request: {
    query: GROUP_SEARCH_QUERY,
    variables: {
      waGroupOpts: { limit: 1 },
      waMessageOpts: { limit: 0, offset: 0 },
      filter: { id: '1' },
    },
  },
  result: {
    data: {
      search: sampleSearchQueryResult,
    },
  },
};
