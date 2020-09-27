import { GET_CURRENT_USER, GET_USERS } from '../graphql/queries/User';

export const getCurrentUserQuery = {
  request: {
    query: GET_CURRENT_USER,
  },
  result: {
    data: {
      currentUser: {
        user: {
          id: '1',
          name: 'John Doe',
          phone: '+919820198765',
          roles: ['admin'],
          contact: {
            id: '1',
          },
          groups: [
            {
              id: '1',
              label: 'Default Group',
              description: '',
            },
          ],
        },
      },
    },
  },
};

export const getUsersQuery = {
  request: {
    query: GET_USERS,
  },
  result: {
    data: {
      users: [
        {
          id: '1',
          name: 'John Doe',
        },
      ],
    },
  },
};
