import { DEFAULT_MESSAGE_LIMIT } from 'common/constants';
import {
  GET_SIMULATOR,
  RELEASE_SIMULATOR,
  SIMULATOR_SEARCH_QUERY,
} from 'graphql/queries/Simulator';
import { SIMULATOR_RELEASE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';
import {
  SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION,
  SIMULATOR_MESSAGE_SENT_SUBSCRIPTION,
} from 'graphql/subscriptions/Simulator';

export const simulatorReleaseSubscription = {
  request: {
    query: SIMULATOR_RELEASE_SUBSCRIPTION,
    variables: { organizationId: null },
  },
  result: {
    data: null,
  },
};

export const simulatorReleaseQuery = {
  request: {
    query: RELEASE_SIMULATOR,
    variables: { organizationId: '1' },
  },
  result: {
    data: {
      simulatorRelease: {
        id: '1',
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

export const messageReceivedSubscription = {
  request: {
    query: SIMULATOR_MESSAGE_RECEIVED_SUBSCRIPTION,
    variables: { organizationId: '1' },
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
};

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

export const messageSendSubscription = {
  request: {
    query: SIMULATOR_MESSAGE_SENT_SUBSCRIPTION,
    variables: { organizationId: '1' },
  },
  result: {
    data: messageSubscriptionData,
  },
};
