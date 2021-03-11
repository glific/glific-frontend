import GET_TRIGGER from '../graphql/queries/Trigger';

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
          endDate: '2021-03-13',
          flow: {
            id: '1',
          },
          frequency,
          group: {
            id: '1',
          },
          id: '1',
          isActive: true,
          isRepeating: true,
          startAt: '2021-02-28T20:00:22Z',
        },
      },
    },
  },
});
