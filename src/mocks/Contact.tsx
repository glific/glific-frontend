import { GET_CONTACT_GROUPS, GET_CONTACT, GET_CONTACT_DETAILS } from '../graphql/queries/Contact';
import { getCurrentUserQuery } from './User';
import { filterTagsQuery } from './Tag';
import { getOrganizationQuery } from '../mocks/Organization';
import { GET_ORGANIZATION } from '../graphql/queries/Organization';

export const contactGroupsQuery = {
  request: {
    query: GET_CONTACT_GROUPS,
    variables: {
      id: '2',
    },
  },
  result: {
    data: {
      contact: {
        contact: {
          groups: [
            {
              id: '1',
              label: 'Default Group',
              users: [],
            },
            {
              id: '2',
              label: 'Staff Group',
              users: [],
            },
          ],
        },
      },
    },
  },
};

export const getContactQuery = {
  request: {
    query: GET_CONTACT,
    variables: { id: 1 },
  },
  result: {
    data: {
      contact: {
        contact: {
          id: '1',
          name: 'Default User',
          phone: '+919820198765',
          language: [],
          status: 'VALID',
          providerStatus: 'SESSION_AND_HSM',
          settings: {},
          fields: {},
          tags: [],
        },
      },
    },
  },
};

const date = new Date();

export const getContactDetailsQuery = {
  request: {
    query: GET_CONTACT_DETAILS,
    variables: { id: 1 },
  },
  result: {
    data: {
      contact: {
        contact: {
          phone: '+919820198765',
          lastMessageAt: date.toISOString(),
          groups: [
            {
              id: '1',
              label: 'Default group',
              users: [],
            },
          ],
          fields: {},
          settings: {},
        },
      },
    },
  },
};

export const LOGGED_IN_USER_MOCK = [
  // ...getOrganizationQuery,
  getCurrentUserQuery,
  getContactDetailsQuery,
  filterTagsQuery,
  getContactQuery,
  getContactDetailsQuery,
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
// console.log(LOGGED_IN_USER_MOCK);
