import { GET_ORGANIZATION } from '../graphql/queries/Organization';

export const getOrganizationQuery = [
  {
    request: {
      query: GET_ORGANIZATION,
    },
    result: {
      data: {
        organization: {
          organization: {
            defaultLanguage: { id: '1', label: 'English (United States)' },
            activeLanguages: [
              {
                id: '1',
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
            defaultLanguage: { id: '1', label: 'English (United States)' },
            activeLanguages: [
              {
                id: '1',
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
            defaultLanguage: { id: '1', label: 'English (United States)' },
            activeLanguages: [
              {
                id: '1',
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
