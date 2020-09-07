import { GET_CURRENT_USER } from '../../graphql/queries/User';
import { GET_CONTACT_DETAILS } from '../../graphql/queries/Contact';

const getContactDetailsQuery = {
  request: {
    query: GET_CONTACT_DETAILS,
    variables: { id: '1' },
  },
  result: {
    data: {
      contact: {
        contact: {
          phone: '+919820198765',
          groups: [
            {
              id: '1',
              label: 'Default group',
              users: [],
            },
          ],
          fields: {},
          lastMessageAt: new Date(),
        },
      },
    },
  },
};

export const LOGGED_IN_USER_MOCK = [
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
          },
        },
      },
    },
  },
  getContactDetailsQuery,
  getContactDetailsQuery,
];
