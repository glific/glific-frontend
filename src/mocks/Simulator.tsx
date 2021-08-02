import { GET_SIMULATOR, RELEASE_SIMULATOR } from 'graphql/queries/Simulator';
import { SIMULATOR_RELEASE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';

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
    variables: {},
  },
  result: {
    simulatorRelease: {
      id: '1',
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
