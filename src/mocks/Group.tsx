import { GET_GROUP, GET_GROUPS, GET_GROUP_USERS } from '../graphql/queries/Group';

export const getGroupQuery = [
  {
    request: {
      query: GET_GROUP,
      variables: { id: 1 },
    },
    result: {
      data: {
        group: {
          group: {
            id: '1',
            label: 'Staff group',
            description: 'Only for staff members',
            users: [
              {
                id: '1',
                name: 'John Doe',
              },
            ],
          },
        },
      },
    },
  },
];

export const getGroupsQuery = [
  {
    request: {
      query: GET_GROUPS,
    },
    result: {
      data: {
        groups: {
          id: '1',
          label: 'Staff group',
          isRestricted: true,
        },
      },
    },
  },
];

export const getGroupUsersQuery = [
  {
    request: {
      query: GET_GROUP_USERS,
      variables: { id: 1 },
    },
    result: {
      data: {
        group: {
          group: {
            users: [
              {
                id: 1,
                name: 'John Doe',
              },
            ],
          },
        },
      },
    },
  },
];
