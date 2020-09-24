import {
  GET_USERS_QUERY,
  FILTER_USERS,
  USER_COUNT,
  GET_USER_ROLES,
} from '../../graphql/queries/User';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import { GET_GROUPS } from '../../graphql/queries/Group';
import { GET_ORGANIZATION } from '../../graphql/queries/Organization';

export const STAFF_MANAGEMENT_MOCKS = [
  {
    request: {
      query: GET_USERS_QUERY,
      variables: { id: 1 },
    },
    result: {
      data: {
        user: {
          user: {
            groups: [],
            id: '1',
            name: 'Glific Admin',
            phone: '919900991223',
            roles: ['admin'],
          },
        },
      },
    },
  },
  {
    request: {
      query: FILTER_USERS,
      variables: { filter: { name: '' }, opts: { limit: 10, offset: 0, order: 'ASC' } },
    },
    result: {
      data: {
        users: [
          {
            groups: [],
            id: '1',
            name: 'Glific Admin',
            phone: '919900991223',
            roles: ['admin'],
            contact: { id: 1 },
          },
        ],
      },
    },
  },
  {
    request: {
      query: USER_COUNT,
      variables: { filter: { name: '' } },
    },
    result: {
      data: {
        countUsers: 1,
      },
    },
  },
  {
    request: {
      query: GET_LANGUAGES,
    },
    result: {
      data: {
        languages: [
          {
            id: '1',
            label: 'English (United States)',
          },
          {
            id: '2',
            label: 'Hindi (India)',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_GROUPS,
    },
    result: {
      data: {
        groups: [
          {
            id: '1',
            label: 'Group 1',
            isRestricted: true,
          },
          {
            id: '2',
            label: 'Group 2',
            isRestricted: true,
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_USER_ROLES,
    },
    result: {
      data: {
        roles: [
          {
            id: 1,
            label: 'none',
          },
          {
            id: 2,
            label: 'staff',
          },
          {
            id: 3,
            label: 'manager',
          },
          {
            id: 4,
            label: 'admin',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_ORGANIZATION,
    },
    result: {
      data: {
        organization: {
          organization: {
            defaultLanguage: { id: '2', label: 'English (United States)' },
            activeLanguages: [
              {
                id: '2',
                label: 'English (United States)',
              },
            ],
            id: '1',
            outOfOffice: {
              enabled: true,
              enabledDays: [
                { enabled: true, id: 1 },
                { enabled: true, id: 2 },
                { enabled: true, id: 3 },
                { enabled: true, id: 4 },
                { enabled: true, id: 5 },
                { enabled: false, id: 6 },
                { enabled: false, id: 7 },
              ],
              endTime: '12:30:27',
              flowId: '6',
              startTime: '12:31:27',
            },
            provider: {
              apiEndPoint: 'https://api.gupshup.io/sm/api/v1',
              id: '1',
              name: 'Gupshup',
              url: 'https://gupshup.io/',
            },
            providerAppname: 'ADD_PROVIDER_API_KEY',
            providerPhone: '917834811114',
            name: 'Glific',
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_ORGANIZATION,
      variables: {},
    },
    result: {
      data: {
        organization: {
          organization: {
            defaultLanguage: { id: '2', label: 'English (United States)' },
            activeLanguages: [
              {
                id: '2',
                label: 'English (United States)',
              },
            ],
            id: '1',
            outOfOffice: {
              enabled: true,
              enabledDays: [
                { enabled: true, id: 1 },
                { enabled: true, id: 2 },
                { enabled: true, id: 3 },
                { enabled: true, id: 4 },
                { enabled: true, id: 5 },
                { enabled: false, id: 6 },
                { enabled: false, id: 7 },
              ],
              endTime: '12:30:27',
              flowId: '6',
              startTime: '12:31:27',
            },
            provider: {
              apiEndPoint: 'https://api.gupshup.io/sm/api/v1',
              id: '1',
              name: 'Gupshup',
              url: 'https://gupshup.io/',
            },
            providerAppname: 'ADD_PROVIDER_API_KEY',
            providerPhone: '917834811114',
            name: 'Glific',
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_ORGANIZATION,
      variables: { id: '1' },
    },
    result: {
      data: {
        organization: {
          organization: {
            defaultLanguage: { id: '2', label: 'English (United States)' },
            activeLanguages: [
              {
                id: '2',
                label: 'English (United States)',
              },
            ],
            id: '1',
            outOfOffice: {
              enabled: true,
              enabledDays: [
                { enabled: true, id: 1 },
                { enabled: true, id: 2 },
                { enabled: true, id: 3 },
                { enabled: true, id: 4 },
                { enabled: true, id: 5 },
                { enabled: false, id: 6 },
                { enabled: false, id: 7 },
              ],
              endTime: '12:30:27',
              flowId: '6',
              startTime: '12:31:27',
            },
            provider: {
              apiEndPoint: 'https://api.gupshup.io/sm/api/v1',
              id: '1',
              name: 'Gupshup',
              url: 'https://gupshup.io/',
            },
            providerAppname: 'ADD_PROVIDER_API_KEY',
            providerPhone: '917834811114',
            name: 'Glific',
          },
        },
      },
    },
  }
];
