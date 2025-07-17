import { DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import { GET_SIMULATOR, RELEASE_SIMULATOR, SIMULATOR_SEARCH_QUERY } from 'graphql/queries/Simulator';
import { SIMULATOR_RELEASE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';
import {
  SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION,
  SIMULATOR_MESSAGE_SENT_SUBSCRIPTION,
} from 'graphql/subscriptions/Simulator';

export const simulatorReleaseSubscription = (variables: any = { organizationId: '1' }) => ({
  request: {
    query: SIMULATOR_RELEASE_SUBSCRIPTION,
    variables,
  },
  result: {
    data: {
      simulatorRelease: '{"simulator_release":{"user_id":1}}',
    },
  },
});

export const simulatorReleaseQuery = {
  request: {
    query: RELEASE_SIMULATOR,
    variables: {},
  },
  result: {
    data: {
      simulatorRelease: {
        id: null,
      },
    },
  },
};

export const simulatorGetQuery = {
  request: {
    query: GET_SIMULATOR,
    variables: {},
  },
  result: {
    data: {
      simulatorGet: {
        id: '1',
        name: 'Glific Simulator',
        phone: '987654321',
      },
    },
  },
};

export const simulatorSearchQuery = {
  request: {
    query: SIMULATOR_SEARCH_QUERY,
    variables: {
      contactOpts: {
        limit: 1,
      },
      filter: { id: '1' },
      messageOpts: {
        limit: DEFAULT_MESSAGE_LIMIT,
      },
    },
  },
  result: {
    data: {
      search: [
        {
          contact: {
            id: '1',
            name: 'Glific Simulator Two',
            phone: '9876543210_2',
          },
          messages: [
            {
              body: 'All Blogs',
              bspMessageId: 'simu-MonixaC7AzXlKbT+NxprLC36PPnLib5AQDmG',
              id: '9741472',
              insertedAt: '2022-07-27T11:08:50.726019Z',
              interactiveContent:
                '{"type":"list","items":[{"title":"Blogs","subtitle":"Blogs","options":[{"type":"text","title":"Blog 1","description":""},{"type":"text","title":"Blog 2","description":""},{"type":"text","title":"Blog 3","description":""},{"type":"text","title":"Blog 4","description":""},{"type":"text","title":"Blog 5","description":""},{"type":"text","title":"Blog 6","description":""},{"type":"text","title":"Blog 7","description":""},{"type":"text","title":"Blog 8","description":""},{"type":"text","title":"Blog 9","description":""},{"type":"text","title":"Blog 10","description":""}]}],"globalButtons":[{"type":"text","title":"Blogs"}],"body":"All Blogs"}',
              location: null,
              media: null,
              receiver: {
                id: '15290',
              },
              sender: {
                id: '716',
              },
              type: 'LIST',
            },
          ],
        },
      ],
    },
  },
};

export const messageReceivedSubscription = (variables: any = { organizationId: '1' }) => ({
  request: {
    query: SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION,
    variables,
  },
  result: {
    data: {
      receivedSimulatorMessage: {
        body: 'hello',
        bspMessageId: '1',
        id: '21',
        insertedAt: '2020-07-11T14:03:28Z',
        receiver: {
          id: '1',
          phone: '917834811114',
        },
        sender: {
          id: '2',
          phone: '919090709009',
        },
        type: 'TEXT',
        media: {
          caption: null,
          url: 'https://filemanager.gupshup.io/fm/wamedia/demobot1/36623b99-5844-4195-b872-61ef34c9ce11',
        },
        location: null,
        interactiveContent: '{}',
      },
    },
  },
});

const messageSubscriptionData = {
  sentSimulatorMessage: {
    body: 'How can we help?',
    bspMessageId: '1',
    id: '22',
    insertedAt: '2020-07-11T14:03:28Z',
    receiver: {
      id: '2',
      phone: '919090909009',
    },
    sender: {
      id: '1',
      phone: '917834811114',
    },

    type: 'TEXT',

    media: {
      caption: null,
      url: 'https://filemanager.gupshup.io/fm/wamedia/demobot1/36623b99-5844-4195-b872-61ef34c9ce11',
    },
    location: null,
    errors: '{}',

    interactiveContent: '{}',
  },
};

export const messageSendSubscription = (variables: any = { organizationId: '1' }) => ({
  request: {
    query: SIMULATOR_MESSAGE_SENT_SUBSCRIPTION,
    variables,
  },
  result: {
    data: messageSubscriptionData,
  },
});

export const keywordSentSubscription = {
  request: {
    query: SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      receivedSimulatorMessage: {
        __typename: 'Message',
        body: 'draft:a',
        bspMessageId: 'e2a84fd5-dfac-4688-91e1-379b20bcae31',
        id: '201',
        insertedAt: '2025-07-17T08:55:27.431750Z',
        interactiveContent: '{}',
        location: null,
        media: null,
        uuid: "e2a84fd5-dfac-4688-91e1-379b20bcae31",
        receiver: {
          __typename: 'Contact',
          id: '6',
        },
        sender: {
          __typename: 'Contact',
          id: '1',
        },
        type: 'TEXT',
      },
    },
  },
  delay: 50
};

export const interactiveMessageReceiveSubscription = {
  request: {
    query: SIMULATOR_MESSAGE_SENT_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      sentSimulatorMessage: {
        __typename: 'Message',
        body: 'Glific comes with all new features',
        bspMessageId: null,
        id: '202',
        uuid: "e2a84fd5-dfac-4688-91e1-379b20bcae31",
        insertedAt: '2025-07-17T08:55:27.476328Z',
        interactiveContent:
          '{"type":"quick_reply","options":[{"type":"text","title":"yes"},{"type":"text","title":"no"}],"content":{"type":"text","text":"Glific comes with all new features","header":"Are you excited for Glific"}}',
        location: null,
        media: null,
        receiver: {
          __typename: 'Contact',
          id: '1',
        },
        sender: {
          __typename: 'Contact',
          id: '6',
        },
        type: 'QUICK_REPLY',
      },
    },
  },
  delay: 50
};
