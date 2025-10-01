import { CREATE_TRIGGER, DELETE_TRIGGER, UPDATE_TRIGGER, VALIDATE_TRIGGER } from 'graphql/mutations/Trigger';
import { TRIGGER_LIST_QUERY, TRIGGER_QUERY_COUNT, GET_TRIGGER } from 'graphql/queries/Trigger';
import { LIST_ITEM_MOCKS as SearchMocks } from 'containers/Search/Search.test.helper';
import { LIST_ITEM_MOCKS } from 'containers/SettingList/SettingList.test.helper';
import { conversationQuery } from './Chat';

export const triggerListQuery = {
  request: {
    query: TRIGGER_LIST_QUERY,
    variables: {
      filter: {},
      opts: {
        limit: 50,
        offset: 0,
        order: 'DESC',
        orderWith: 'updated_at',
      },
    },
  },

  result: {
    data: {
      triggers: [
        {
          id: '1',
          name: 'Feedback 2020/01/12 13:01PM',
          days: [1, 2],
          nextTriggerAt: null,
          frequency: 'weekly',
          flow: { id: '1', name: 'Help Workflow' },
          groups: ['Optin contacts'],
          endDate: '2021-03-13',
          hours: [],
          isActive: true,
          isRepeating: true,
          roles: [],
          startAt: '2020-12-30T13:15:19Z',
        },
        {
          id: '2',
          name: 'Activity 2020/01/12 13:01PM',
          nextTriggerAt: null,
          groups: [],
          days: [],
          roles: [],
          frequency: 'daily',
          flow: { id: '1', name: 'Activity' },
          group: { id: '1', label: 'Optin contacts' },
          endDate: '2021-03-13',
          isActive: false,
          hours: [],
          isRepeating: true,
          startAt: '2020-12-30T13:15:19Z',
        },
      ],
    },
  },
};

export const triggerCountQuery = {
  request: {
    query: TRIGGER_QUERY_COUNT,
    variables: {
      filter: {},
    },
  },

  result: {
    data: {
      countTriggers: 5,
    },
  },
};

export const getTriggerQuery = (frequency: any, additionalFields?: any) => ({
  request: {
    query: GET_TRIGGER,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      trigger: {
        trigger: {
          days: [],
          endDate: '2021-03-13',
          flow: {
            id: '1',
          },
          groupType: 'WABA',
          groups: [],
          roles: [],
          frequency,
          hours: [],
          id: '1',
          isActive: true,
          isRepeating: true,
          startAt: '2021-02-28T20:00:22Z',
          ...additionalFields,
        },
      },
    },
  },
});

export const createTriggerQuery = (input: any) => ({
  request: {
    query: CREATE_TRIGGER,
    variables: { input },
  },
  result: {
    data: {
      createTrigger: {
        trigger: {
          days: [],
          endDate: '2021-03-13',
          flow: {
            id: '1',
          },
          roles: [],
          name: 'New trigger',
          frequency: 'none',
          hours: [],
          groups: [],
          id: '1',
          isActive: true,
          isRepeating: false,
          startAt: '2021-02-28T20:00:22Z',
        },
      },
    },
  },
});

export const updateTriggerQuery = {
  request: {
    query: UPDATE_TRIGGER,
    variables: {
      id: '1',
      input: {
        isActive: true,
        isRepeating: true,
        flowId: '1',
        days: [],
        hours: [0, 1],
        groupIds: [1],
        startDate: '2021-02-28',
        endDate: '2021-03-13',
        startTime: 'T20:00:22',
        frequency: 'hourly',
        groupType: 'WABA',
        addRoleIds: [],
        deleteRoleIds: [],
      },
    },
  },
  result: {
    data: {
      updateTrigger: {
        trigger: {
          days: [],
          endDate: '2021-03-13',
          flow: {
            id: '1',
          },
          roles: [],
          name: 'New trigger',
          frequency: 'none',
          hours: [],
          groups: [],
          id: '1',
          isActive: true,
          isRepeating: false,
          startAt: '2021-02-28T20:00:22Z',
        },
      },
    },
  },
};

export const deleteTriggerQuery = {
  request: {
    query: DELETE_TRIGGER,
    variables: {
      id: '1',
    },
  },
  result: {
    data: {
      deleteTrigger: {
        __typename: 'TriggerResult',
        errors: null,
      },
    },
  },
};

export const validateTrigger = (flowId: string, validateTrigger: any) => ({
  request: {
    query: VALIDATE_TRIGGER,
    variables: {
      input: {
        flowId,
      },
    },
  },
  result: {
    data: {
      validateTrigger,
    },
  },
});

export const TRIGGER_MOCKS = [
  ...LIST_ITEM_MOCKS,
  ...SearchMocks,
  conversationQuery,
  triggerListQuery,
  triggerCountQuery,
  deleteTriggerQuery,
  updateTriggerQuery,
  validateTrigger('2', {
    errors: null,
    success: true,
  }),
  validateTrigger('1', {
    __typename: 'ValidateTriggerResult',
    errors: [
      {
        key: 'warning',
        message: 'The first message node is not an HSM template',
      },
    ],
    success: false,
  }),
];
