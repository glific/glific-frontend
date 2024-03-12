import { DEFAULT_ENTITY_LIMIT, DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import { GROUP_SEARCH_MULTI_QUERY, GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';

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
        search: [
          {
            __typename: 'WaConversation',
            group: null,
            messages: [
              {
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
              },
            ],
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
        search: [
          {
            __typename: 'WaConversation',
            group: null,
            messages: [
              {
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
              },
            ],
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
        ],
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
            __typename: 'WaConversation',
            group: {
              __typename: 'Group',
              id: '7',
              label: 'Whatsapp Group Collection 1',
            },
            messages: null,
            waGroup: null,
          },
          {
            __typename: 'WaConversation',
            group: {
              __typename: 'Group',
              id: '8',
              label: 'Whatsapp Group Collection 2',
            },
            messages: null,
            waGroup: null,
          },
          {
            __typename: 'WaConversation',
            group: {
              __typename: 'Group',
              id: '6',
              label: 'Default WA Group Collection',
            },
            messages: null,
            waGroup: null,
          },
        ],
      },
    },
  },
];
