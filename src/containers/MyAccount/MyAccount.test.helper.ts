import { GET_CURRENT_USER } from "../../graphql/queries/User";

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
          },
        },
      },
    },
  },

];