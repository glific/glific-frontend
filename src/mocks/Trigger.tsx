import dayjs from 'dayjs';
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
          frequency: 'weekly',
          flow: { id: '1', name: 'Help Workflow' },
          group: { id: '1', label: 'Optin contacts' },
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

export const getTriggerQuery = (frequency: any) => ({
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
          days: [1, 2],
          endDate: dayjs('2021-03-13'),
          flow: {
            id: '1',
          },
          roles: [],
          frequency,
          hours: [],
          group: {
            id: '1',
          },
          id: '1',
          isActive: true,
          isRepeating: true,
          startAt: dayjs('2021-02-28T20:00:22Z'),
        },
      },
    },
  },
});

const hourlyTrigger = () => {
  const hourlyTrigger: any = getTriggerQuery('hourly');
  hourlyTrigger.result.data.trigger.trigger.days = [];
  hourlyTrigger.result.data.trigger.trigger.hours = [1, 13];
  return hourlyTrigger;
};

export { hourlyTrigger };