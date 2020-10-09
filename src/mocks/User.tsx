import { UPDATE_CURRENT_USER } from '../graphql/mutations/User';
import { GET_CURRENT_USER, GET_USERS } from '../graphql/queries/User';
import { setVariables } from '../common/constants';

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
    variables: setVariables(),
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

export const updateUserQuery = [
  {
    request: {
      query: UPDATE_CURRENT_USER,
      variables: { input: { otp: '76554', password: 'pass123456' } },
    },
    result: {
      data: {
        updateCurrentUser: {
          errors: null,
          user: {
            id: '2',
            name: 'Updated Name',
          },
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_CURRENT_USER,
      variables: { input: { otp: '1234', password: 'pass123456' } },
    },
    result: {
      data: {
        updateCurrentUser: {
          errors: [{ message: 'incorrect_code' }],
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_CURRENT_USER,
      variables: { input: { otp: '4567', password: 'pass123456' } },
    },
    result: {
      data: {
        updateCurrentUser: {
          errors: [{ message: 'Too many attempts' }],
        },
      },
    },
  },
];
