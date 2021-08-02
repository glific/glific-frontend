import { GET_USERS_QUERY, FILTER_USERS, USER_COUNT, GET_USER_ROLES } from 'graphql/queries/User';
import { UPDATE_USER } from 'graphql/mutations/User';
import { USER_LANGUAGES } from 'graphql/queries/Organization';
import { GET_COLLECTIONS } from 'graphql/queries/Collection';

const GET_ROLES_MOCK = {
  request: {
    query: GET_USER_ROLES,
    variables: {},
  },
  result: {
    data: {
      roles: ['Admin', 'Glific admin', 'Manager', 'No access', 'Staff'],
    },
  },
};

const GET_USER_MOCK = {
  request: {
    query: GET_USERS_QUERY,
    variables: { id: '1' },
  },
  result: {
    data: {
      user: {
        user: {
          id: '1',
          name: 'Staff',
          phone: '919999988888',
          isRestricted: false,
          roles: ['Staff'],
          groups: [
            {
              id: '2',
              label: 'Optout contacts',
            },
          ],
        },
      },
    },
  },
};

const GET_USER_LANGUAGE_MOCK = {
  request: {
    query: USER_LANGUAGES,
    variables: {},
  },
  result: {
    data: {
      currentUser: {
        user: {
          organization: {
            activeLanguages: [
              {
                id: '1',
                label: 'English',
                locale: 'en',
                localized: true,
              },
              {
                id: '2',
                label: 'Hindi',
                locale: 'hi',
                localized: true,
              },
            ],
            defaultLanguage: {
              id: '1',
              label: 'English',
            },
          },
        },
      },
    },
  },
};

const GET_GROUPS = {
  request: {
    query: GET_COLLECTIONS,
    variables: {
      filter: {},
      opts: { limit: null, offset: 0, order: 'ASC' },
    },
  },
  result: {
    data: {
      groups: [
        {
          id: '3',
          isRestricted: false,
          label: 'Default Group',
        },
        {
          id: '1',
          isRestricted: false,
          label: 'Optin contacts',
        },
        {
          id: '2',
          isRestricted: false,
          label: 'Optout contacts',
        },
        {
          id: '4',
          isRestricted: true,
          label: 'Restricted Group',
        },
      ],
    },
  },
};

const UPDATE_USER_MOCK = {
  request: {
    query: UPDATE_USER,
    variables: {
      id: '1',
      input: { name: 'Staff Admin', isRestricted: false, groupIds: ['2'], roles: ['Staff'] },
    },
  },
  result: {
    data: {
      updateUser: {
        errors: null,
        user: {
          groups: [
            {
              id: '2',
              label: 'Optout contacts',
            },
          ],
          id: '1',
          isRestricted: false,
          name: 'Staff Admin',
          phone: '919999988888',
          roles: ['Staff'],
        },
      },
    },
  },
};

export const STAFF_MANAGEMENT_MOCKS = [
  GET_USER_MOCK,
  GET_ROLES_MOCK,
  GET_USER_LANGUAGE_MOCK,
  GET_GROUPS,
  UPDATE_USER_MOCK,
];

export const USER_COUNT_MOCK = {
  request: {
    query: USER_COUNT,
    variables: { filter: {} },
  },
  result: {
    data: {
      countUsers: 5,
    },
  },
};

const createUserMockData = new Array(5).fill(null).map((val, idx) => {
  const index = idx + 1;
  const roles = ['Admin', 'Glific_admin', 'Staff', 'Manager', 'Manager'];
  return {
    id: `${index}`,
    name: `NGO Main Account${index}`,
    phone: `91987654321${index}`,
    roles: [roles[idx]],
    groups: [],
    contact: {
      id: `${index}`,
    },
  };
});

export const FILTER_USER_MOCK = {
  request: {
    query: FILTER_USERS,
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
      users: createUserMockData,
    },
  },
};
