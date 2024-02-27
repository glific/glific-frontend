import { GROUP_QUERY_VARIABLES } from 'common/constants';
import { GROUP_SEARCH_QUERY } from 'graphql/queries/WA_Groups';

const withResult = {
  data: {
    search: [
      {
        __typename: 'WaConversation',
        messages: [
          {
            __typename: 'WaMessage',
            body: 'y',
            id: '26',
            insertedAt: '2024-02-26T16:51:39.405641Z',
            status: 'sent',
          },
          {
            __typename: 'WaMessage',
            body: 'test',
            id: '20',
            insertedAt: '2024-02-26T16:50:00.776602Z',
            status: 'sent',
          },
        ],
        waGroup: {
          __typename: 'WaGroup',
          bspId: '120363238069881530@g.us',
          id: '3',
          label: 'Maytapi Testing ',
          lastCommunicationAt: '2024-02-26T16:51:39Z',
          waManagedPhone: {
            __typename: 'WaManagedPhone',
            id: '3',
            label: null,
            phone: '918657048983',
            phoneId: 43876,
          },
        },
      },
    ],
  },
};

const noResult = { data: { search: [] } };

export const groupSearchQuery = (
  messageLimit: object,
  contactLimit: number,
  filter: any,
  showResult: boolean = true
) => {
  return {
    request: {
      query: GROUP_SEARCH_QUERY,
      variables: {
        waMessageOpts: {
          limit: 25,
        },
        waGroupOpts: {
          limit: 10,
        },
        filter: {},
      },
    },
    result: showResult ? withResult : noResult,
  };
};

export const groupsmockquery = {
  request: {
    query: GROUP_SEARCH_QUERY,
    variables: GROUP_QUERY_VARIABLES,
  },
  result: withResult,
};

export const groupCollectionSearchQuery = () => {
  return {
    result: {
      data: {
        search: [
          {
            __typename: 'Conversation',
            wa_group: null,
            group: {
              __typename: 'Group',
              id: '1',
              label: 'Optout contacts',
            },
            messages: [],
          },
          {
            __typename: 'Conversation',
            wa_group: null,
            group: {
              __typename: 'Group',
              id: '2',
              label: 'Default Group',
            },
            messages: [
              {
                __typename: 'Message',
                id: '16',
                body: 'Default Group message body',
                insertedAt: '2024-02-17T21:14:19.457253Z',
                messageNumber: 1,
                receiver: {
                  __typename: 'Contact',
                  id: '1',
                },
                sender: {
                  __typename: 'Contact',
                  id: '2',
                },
                location: null,
                type: 'TEXT',
                media: null,
                errors: '{}',
                contextMessage: null,
                interactiveContent: '{}',
                sendBy: '',
                flowLabel: null,
              },
            ],
          },
        ],
      },
    },
  };
};

export const mockResolver = () => {
  return withResult.data;
};
