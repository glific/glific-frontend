import {
  GET_ORGANIZATION,
  USER_LANGUAGES,
  GET_PROVIDERS,
  GET_CREDENTIAL,
} from '../graphql/queries/Organization';

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
            name: 'Glific',
          },
        },
      },
    },
  },
];

export const getProvidersQuery = [
  {
    request: {
      query: GET_PROVIDERS,
    },
    result: {
      data: {
        providers: [
          {
            group: 'bsp',
            id: '1',
            isRequired: true,
            keys:
              '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Gupshup.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://gupshup.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://api.gupshup.io/sm/api/v1"}}',
            name: 'Gupshup',
            secrets:
              '{"app_name":{"view_only":false,"type":"string","label":"App Name","default":null},"api_key":{"view_only":false,"type":"string","label":"API Key","default":null}}',
            shortcode: 'gupshup',
            description: 'sample description',
          },
          {
            group: 'bsp',
            id: '2',
            isRequired: true,
            keys:
              '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Glifproxy.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://glific.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://glific.test:4000/"}}',
            name: 'Glifproxy',
            secrets: '{}',
            shortcode: 'glifproxy',
            description: 'sample description',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_PROVIDERS,
      variables: { filter: { shortcode: null } },
    },
    result: {
      data: {
        providers: [
          {
            group: 'bsp',
            id: '1',
            isRequired: true,
            keys:
              '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Gupshup.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://gupshup.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://api.gupshup.io/sm/api/v1"}}',
            name: 'Gupshup',
            secrets:
              '{"app_name":{"view_only":false,"type":"string","label":"App Name","default":null},"api_key":{"view_only":false,"type":"string","label":"API Key","default":null}}',
            shortcode: 'gupshup',
            description: 'sample description',
          },
          {
            group: 'bsp',
            id: '2',
            isRequired: true,
            keys:
              '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Glifproxy.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://glific.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://glific.test:4000/"}}',
            name: 'Glifproxy',
            secrets: '{}',
            shortcode: 'glifproxy',
            description: 'sample description',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_PROVIDERS,
      variables: { filter: { shortcode: 'gupshup' } },
    },
    result: {
      data: {
        providers: [
          {
            group: 'bsp',
            id: '1',
            isRequired: true,
            keys:
              '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Gupshup.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://gupshup.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://api.gupshup.io/sm/api/v1"}}',
            name: 'Gupshup',
            secrets:
              '{"app_name":{"view_only":false,"type":"string","label":"App Name","default":null},"api_key":{"view_only":false,"type":"string","label":"API Key","default":null}}',
            shortcode: 'gupshup',
            description: 'sample description',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_PROVIDERS,
      variables: { filter: { shortcode: 'organization' } },
    },
    result: {
      data: {
        providers: [{}],
      },
    },
  },
];

export const getCredential = [
  {
    request: {
      query: GET_CREDENTIAL,
    },
    result: {
      data: {
        credential: {
          credential: {
            id: '1',
            keys:
              '{"worker":"Glific.Providers.Gupshup.Worker","url":"https://gupshup.io/","handler":"Glific.Providers.Gupshup.Message","api_end_point":"https://api.gupshup.io/sm/api/v1"}',
            provider: {
              shortcode: 'gupshup',
            },
            secrets:
              '{"app_name":"Please enter your App Name here","api_key":"Please enter your key here"}',
            isActive: true,
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_CREDENTIAL,
      variables: { shortcode: null },
    },
    result: {
      data: {
        credential: {
          credential: {
            id: '1',
            keys:
              '{"worker":"Glific.Providers.Gupshup.Worker","url":"https://gupshup.io/","handler":"Glific.Providers.Gupshup.Message","api_end_point":"https://api.gupshup.io/sm/api/v1"}',
            provider: {
              shortcode: 'gupshup',
            },
            secrets:
              '{"app_name":"Please enter your App Name here","api_key":"Please enter your key here"}',
            isActive: true,
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_CREDENTIAL,
      variables: { shortcode: 'gupshup' },
    },
    result: {
      data: {
        credential: {
          credential: {
            id: '1',
            keys:
              '{"worker":"Glific.Providers.Gupshup.Worker","url":"https://gupshup.io/","handler":"Glific.Providers.Gupshup.Message","api_end_point":"https://api.gupshup.io/sm/api/v1"}',
            provider: {
              shortcode: 'gupshup',
            },
            secrets:
              '{"app_name":"Please enter your App Name here","api_key":"Please enter your key here"}',
            isActive: true,
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_CREDENTIAL,
      variables: { shortcode: 'gupshup' },
    },
    result: {
      data: {
        credential: {
          credential: {
            id: '1',
            keys:
              '{"worker":"Glific.Providers.Gupshup.Worker","url":"https://gupshup.io/","handler":"Glific.Providers.Gupshup.Message","api_end_point":"https://api.gupshup.io/sm/api/v1"}',
            provider: {
              shortcode: 'gupshup',
            },
            secrets:
              '{"app_name":"Please enter your App Name here","api_key":"Please enter your key here"}',
            isActive: true,
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_CREDENTIAL,
      variables: { filter: { shortcode: 'organization' } },
    },
    result: {
      data: {
        credential: {},
      },
    },
  },
];

export const getOrganizationLanguagesQuery = {
  request: {
    query: USER_LANGUAGES,
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
