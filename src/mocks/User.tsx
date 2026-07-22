import { UPDATE_CURRENT_USER } from 'graphql/mutations/User';
import { FILTER_USERS, GET_CURRENT_USER, GET_USERS, GET_USER_CONTACT_IDS } from 'graphql/queries/User';
import { setVariables } from 'common/constants';

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
          email: 'you@domain.com',
          contact: {
            id: '1',
            name: 'Glific user',
            phone: '9876543210',
          },
          accessRoles: [
            {
              id: '1',
              label: 'Admin',
            },
          ],
          groups: [
            {
              id: '1',
              label: 'Default Collection',
              description: '',
            },
          ],
          organization: {
            id: '1',
            contact: {
              phone: '917834811114',
            },
          },
          language: {
            id: '1',
            locale: 'en',
          },
        },
      },
    },
  },
};

export const getCurrentUserNullEmailQuery = {
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
          email: null,
          contact: {
            id: '1',
            name: 'Glific user',
            phone: '9876543210',
          },
          accessRoles: [
            {
              id: '1',
              label: 'Admin',
            },
          ],
          groups: [
            {
              id: '1',
              label: 'Default Collection',
              description: '',
            },
          ],
          organization: {
            id: '1',
            contact: {
              phone: '917834811114',
            },
          },
          language: {
            id: '1',
            locale: 'en',
          },
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

export const updateLanguageQuery = {
  request: {
    query: UPDATE_CURRENT_USER,
    variables: { input: { languageId: '2' } },
  },
  result: {
    data: {
      updateCurrentUser: {
        errors: null,
        user: null,
      },
    },
  },
};

// saving with only the email changed (password left blank, so it's omitted from the input)
export const updateAccountEmailOnlyQuery = {
  request: {
    query: UPDATE_CURRENT_USER,
    variables: { input: { otp: '76554', email: 'newemail@domain.com' } },
  },
  result: {
    data: {
      updateCurrentUser: {
        errors: null,
        user: {
          id: '1',
          name: 'John Doe',
          email: 'newemail@domain.com',
        },
      },
    },
  },
};

// saving with both email (unchanged) and a new password
export const updateAccountWithPasswordQuery = {
  request: {
    query: UPDATE_CURRENT_USER,
    variables: { input: { otp: '76554', email: 'you@domain.com', password: 'Password123!' } },
  },
  result: {
    data: {
      updateCurrentUser: {
        errors: null,
        user: {
          id: '1',
          name: 'John Doe',
          email: 'you@domain.com',
        },
      },
    },
  },
};

export const updateAccountIncorrectOtpQuery = {
  request: {
    query: UPDATE_CURRENT_USER,
    variables: { input: { otp: '1234', email: 'you@domain.com' } },
  },
  result: {
    data: {
      updateCurrentUser: {
        errors: [{ message: 'incorrect_code' }],
        user: null,
      },
    },
  },
};

export const updateAccountTooManyAttemptsQuery = {
  request: {
    query: UPDATE_CURRENT_USER,
    variables: { input: { otp: '4567', email: 'you@domain.com' } },
  },
  result: {
    data: {
      updateCurrentUser: {
        errors: [{ message: 'Too many attempts' }],
        user: null,
      },
    },
  },
};

export const updateAccountEmailTakenQuery = {
  request: {
    query: UPDATE_CURRENT_USER,
    variables: { input: { otp: '76554', email: 'taken@domain.com' } },
  },
  result: {
    data: {
      updateCurrentUser: {
        errors: [{ key: 'email', message: 'has already been taken' }],
        user: null,
      },
    },
  },
};

export const getCurrentUserErrorQuery = {
  request: {
    query: GET_CURRENT_USER,
  },
  error: new Error('Invalid'),
};

export const getCurrentUserInvalidRoleQuery = {
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
          roles: ['None'],
          accessRoles: [
            {
              id: '1',
              label: 'None',
            },
          ],
          contact: {
            id: '1',
          },
          groups: [
            {
              id: '1',
              label: 'Default Collection',
              description: '',
            },
          ],
          organization: {
            id: '1',
          },
          language: {
            id: '1',
            locale: 'en',
          },
        },
      },
    },
  },
};

export const getUsers = {
  request: {
    query: FILTER_USERS,
    variables: { filter: {}, opts: { limit: null, offset: 0, order: 'ASC' } },
  },
  result: {
    data: {
      users: [
        {
          accessRoles: [
            {
              label: 'Admin',
            },
          ],
          contact: {
            id: '14',
          },
          groups: [],
          id: '1',
          name: 'NGO Admin',
          phone: '919999988888',
        },
      ],
    },
  },
};

export const getUsersEmptyVars = {
  request: {
    query: GET_USER_CONTACT_IDS,
    variables: {},
  },
  result: {
    data: {
      users: [
        {
          contact: {
            id: '14',
          },
        },
      ],
    },
  },
};
export const getUsersEmptyVars2 = {
  request: {
    query: GET_USER_CONTACT_IDS,
    variables: {},
  },
  result: {
    data: {
      users: [
        {
          contact: {
            id: '3',
          },
        },
      ],
    },
  },
};
