import GET_TRIGGER from '../graphql/queries/Trigger';

export const getTriggerQuery = {
  request: {
    query: GET_TRIGGER,
    variables: {
      id: 1,
    },
  },
  result: {
    data: {
      trigger: [
        {
          days: [1, 2],
          endDate: '2021-03-13',
          flow: {
            id: '2',
          },
          frequency: 'weekly',
          group: {
            id: '2',
          },
          id: '1',
          isActive: true,
          isRepeating: true,
          startAt: '2021-02-28T20:00:22Z',
        },
      ],
    },
  },
};
