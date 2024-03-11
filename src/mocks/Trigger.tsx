import { CREATE_TRIGGER, UPDATE_TRIGGER, VALIDATE_TRIGGER } from 'graphql/mutations/Trigger';
import { TRIGGER_LIST_QUERY, TRIGGER_QUERY_COUNT, GET_TRIGGER } from 'graphql/queries/Trigger';

export const triggerListQuery = {
  request: {
    query: TRIGGER_LIST_QUERY,
    variables: {
      filter: {},
      opts: {
        limit: 50,
        offset: 0,
        order: 'ASC',
        orderWith: 'name',
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

export const getTriggerQuery = (frequency: any) => {
  return {
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
            name: 'AB Test Workflow_11/3/2024_2:00PM',
            days: [],
            endDate: '2030-03-13',
            flow: {
              id: '1',
            },
            groups: ['Group 1'],
            roles: [],
            frequency,
            hours: [],
            id: '1',
            isActive: true,
            isRepeating: true,
            startAt: '2029-02-28T20:00:22Z',
          },
        },
      },
    },
  };
};

const hourlyTrigger = () => {
  const hourlyTrigger: any = getTriggerQuery('hourly');
  hourlyTrigger.result.data.trigger.trigger.days = [];
  hourlyTrigger.result.data.trigger.trigger.hours = [1, 13];
  return hourlyTrigger;
};

export const createNoFrequencyTriggerQuery = {
  request: {
    query: CREATE_TRIGGER,
    variables: {
      input: {
        isActive: true,
        isRepeating: false,
        flowId: '1',
        days: [],
        hours: [],
        groupIds: [1],
        startDate: '2030-09-03',
        endDate: '2030-10-02',
        startTime: 'T03:30:00',
        frequency: 'none',
        addRoleIds: [],
        deleteRoleIds: [],
      },
    },
  },
  result: {
    data: {
      createTrigger: {
        trigger: {
          days: [],
          endDate: '2030-10-02',
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
          startAt: '2030-02-28T20:00:22Z',
        },
      },
    },
  },
};

export const createTriggerQuery = {
  request: {
    query: CREATE_TRIGGER,
    variables: {
      id: '1',
      input: {
        isActive: true,
        isRepeating: true,
        flowId: '1',
        days: [],
        hours: [],
        groupIds: [1],
        startDate: '2029-02-28',
        endDate: '2030-03-12',
        startTime: 'T20:00:22',
        frequency: 'daily',
        addRoleIds: [],
        deleteRoleIds: [],
      },
    },
  },
  result: {
    data: {
      createTrigger: {
        trigger: {
          days: [],
          endDate: '2030-03-12',
          flow: {
            id: '1',
          },
          roles: [],
          name: 'New trigger',
          frequency: 'daily',
          hours: [],
          groups: [],
          id: '1',
          isActive: true,
          isRepeating: false,
          startAt: '2029-02-28T20:00:22Z',
        },
      },
    },
  },
};

export const updateTriggerQuery = {
  request: {
    query: UPDATE_TRIGGER,
    variables: {
      id: '1',
      input: {
        isActive: true,
        isRepeating: false,
        flowId: '1',
        days: [],
        hours: [],
        groupId: '1',
        startDate: '2021-02-28',
        endDate: '2021-03-13',
        startTime: 'T20:00:22',
        frequency: 'none',
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

export const validateTriggerQuery = {
  request: {
    query: VALIDATE_TRIGGER,
    variables: { input: { flowId: '1' } },
  },
  result: {
    data: {
      validateTrigger: {
        errors: null,
        success: true,
      },
    },
  },
};

export { hourlyTrigger };
