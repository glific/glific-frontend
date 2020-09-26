import { UPDATE_CURRENT_USER } from '../../graphql/mutations/User';
import { GET_CURRENT_USER } from '../../graphql/queries/User';

export const MY_ACCOUNT_MOCKS = [
  {
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
  },
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
