import { UPDATE_CREDENTIAL } from 'graphql/mutations/Organization';
import {
  GET_ORGANIZATION,
  USER_LANGUAGES,
  GET_PROVIDERS,
  GET_CREDENTIAL,
  BSPBALANCE,
  FILTER_ORGANIZATIONS,
  GET_ORGANIZATION_COUNT,
  GET_ORGANIZATION_PROVIDER,
} from 'graphql/queries/Organization';
import { BSP_BALANCE_SUBSCRIPTION } from 'graphql/subscriptions/PeriodicInfo';

export const getOrganizationQuery = [
  {
    request: {
      query: GET_ORGANIZATION,
    },
    result: {
      data: {
        organization: {
          organization: {
            defaultLanguage: { id: 1, label: 'English (United States)' },
            activeLanguages: [
              {
                id: 1,
                label: 'English (United States)',
              },
            ],
            id: 1,
            outOfOffice: {
              enabled: true,
              defaultFlowId: 1,
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
              flowId: 2,
              startTime: '12:31:27',
            },
            name: 'Glific',
            newcontactFlowId: '1',
            signaturePhrase: 'Sample text',
            contact: {
              phone: 911111111111,
            },
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
            defaultLanguage: { id: 1, label: 'English (United States)' },
            activeLanguages: [
              {
                id: 1,
                label: 'English (United States)',
              },
            ],
            id: 1,
            outOfOffice: {
              enabled: true,
              defaultFlowId: 1,
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
              flowId: 2,
              startTime: '12:31:27',
            },
            name: 'Glific',
            signaturePhrase: 'Sample text',
            contact: {
              phone: 911111111111,
            },
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_ORGANIZATION,
      variables: { id: 1 },
    },
    result: {
      data: {
        organization: {
          organization: {
            activeLanguages: [
              { id: '1', label: 'English' },
              { id: '2', label: 'Hindi' },
            ],
            contact: { phone: '917834811114' },
            defaultLanguage: { id: '1', label: 'English' },
            id: '1',
            name: 'Glific',
            outOfOffice: {
              defaultFlowId: '7',
              enabled: true,
              enabledDays: [
                { enabled: true, id: 1 },
                { enabled: true, id: 2 },
                { enabled: true, id: 3 },
                { enabled: true, id: 4 },
                { enabled: true, id: 5 },
                { enabled: true, id: 6 },
                { enabled: true, id: 7 },
              ],
              endTime: '20:00:00',
              flowId: '1',
              startTime: '09:00:00',
            },
            signaturePhrase: 'Please change me, NOW!',
          },
        },
      },
    },
  },
];
export const getOrganisationSettings = {
  request: {
    query: GET_ORGANIZATION,
    variables: { id: '1' },
  },
  result: {
    data: {
      organization: {
        organization: {
          defaultLanguage: { id: 1, label: 'English (United States)' },
          activeLanguages: [
            {
              id: 1,
              label: 'English (United States)',
            },
          ],
          id: '1',
          outOfOffice: {
            enabled: true,
            defaultFlowId: 1,
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
            flowId: 2,
            startTime: '12:31:27',
          },
          name: 'Glific',
          signaturePhrase: 'Sample text',
          contact: {
            phone: 911111111111,
          },
        },
      },
    },
  },
};
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
            keys: '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Gupshup.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://gupshup.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://api.gupshup.io/sm/api/v1"}}',
            name: 'Gupshup',
            secrets:
              '{"app_name":{"view_only":false,"type":"string","label":"App Name","default":"Glific"},"api_key":{"view_only":false,"type":"string","label":"API Key","default":"Glific"}}',
            shortcode: 'gupshup',
            description: 'sample description',
          },
          {
            group: 'bsp',
            id: '2',
            isRequired: true,
            keys: '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Glifproxy.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://glific.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://glific.test:4000/"}}',
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
            keys: '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Gupshup.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://gupshup.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://api.gupshup.io/sm/api/v1"}}',
            name: 'Gupshup',
            secrets:
              '{"app_name":{"view_only":false,"type":"string","label":"App Name","default":"Glific"},"api_key":{"view_only":false,"type":"string","label":"API Key","default":"Glific"}}',
            shortcode: 'gupshup',
            description: 'sample description',
          },
          {
            group: 'bsp',
            id: '2',
            isRequired: true,
            keys: '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Glifproxy.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://glific.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://glific.test:4000/"}}',
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
            keys: '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Gupshup.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://gupshup.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://api.gupshup.io/sm/api/v1"}}',
            name: 'Gupshup',
            secrets:
              '{"app_name":{"view_only":false,"type":"string","label":"App Name","default":"Glific"},"api_key":{"view_only":false,"type":"string","label":"API Key","default":"Glific"}}',
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
  {
    request: {
      query: UPDATE_CREDENTIAL,
      variables: {
        id: '1',
        input: {
          shortcode: 'gupshup',
          isActive: true,
          keys: '{"worker":"Glific.Providers.Gupshup.Worker","url":"https://gupshup.io/","handler":"Glific.Providers.Gupshup.Message","api_end_point":"https://api.gupshup.io/sm/api/v1"}',
          secrets:
            '{"app_name":"Please enter your App Name here","api_key":"Please enter your key here"}',
        },
      },
    },
    result: {
      data: {
        updateCredential: {
          credential: {
            id: '1',
            keys: '{"worker":{"view_only":true,"type":"string","label":"Outbound Message Worker","default":"Glific.Providers.Gupshup.Worker"},"url":{"view_only":true,"type":"string","label":"BSP Home Page","default":"https://gupshup.io/"},"handler":{"view_only":true,"type":"string","label":"Inbound Message Handler","default":"Glific.Providers.Gupshup.Message"},"api_end_point":{"view_only":false,"type":"string","label":"API End Point","default":"https://api.gupshup.io/sm/api/v1"}}',
            provider: { shortcode: 'gupshup' },
            secrets:
              '{"app_name":"Please enter your App Name here","api_key":"Please enter your key here"}',
          },
          errors: null,
        },
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
            keys: '{"worker":"Glific.Providers.Gupshup.Worker","url":"https://gupshup.io/","handler":"Glific.Providers.Gupshup.Message","api_end_point":"https://api.gupshup.io/sm/api/v1"}',
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
            keys: '{"worker":"Glific.Providers.Gupshup.Worker","url":"https://gupshup.io/","handler":"Glific.Providers.Gupshup.Message","api_end_point":"https://api.gupshup.io/sm/api/v1"}',
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
            keys: '{"worker":"Glific.Providers.Gupshup.Worker","url":"https://gupshup.io/","handler":"Glific.Providers.Gupshup.Message","api_end_point":"https://api.gupshup.io/sm/api/v1"}',
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
            keys: '{"worker":"Glific.Providers.Gupshup.Worker","url":"https://gupshup.io/","handler":"Glific.Providers.Gupshup.Message","api_end_point":"https://api.gupshup.io/sm/api/v1"}',
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
                localized: true,
                locale: 'en',
              },
              {
                id: '2',
                label: 'Hindi',
                localized: true,
                locale: 'hi',
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

export const getOrganizationLanguagesQueryByOrder = {
  request: {
    query: USER_LANGUAGES,
    variables: { opts: { order: 'ASC' } },
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
                localized: true,
                locale: 'en',
              },
              {
                id: '2',
                label: 'Marathi',
                localized: true,
                locale: 'mr',
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

export const getOrganizationLanguagesWithoutOrder = {
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
                localized: true,
                locale: 'en',
              },
              {
                id: '2',
                label: 'Marathi',
                localized: true,
                locale: 'mr',
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

export const walletBalanceSubscription = [
  {
    request: {
      query: BSP_BALANCE_SUBSCRIPTION,
      variables: { organizationId: null },
    },
    result: {
      data: {
        bspBalance: '{"balance":0.787}',
      },
    },
  },
  {
    request: {
      query: BSP_BALANCE_SUBSCRIPTION,
      variables: { organizationId: '1' },
    },
    result: {
      data: {
        bspBalance: '{"balance":0.787}',
      },
    },
  },
];

export const walletBalanceHighSubscription = [
  {
    request: {
      query: BSP_BALANCE_SUBSCRIPTION,
      variables: { organizationId: null },
    },
    result: {
      data: {
        bspBalance: '{"balance":10.379}',
      },
    },
  },
  {
    request: {
      query: BSP_BALANCE_SUBSCRIPTION,
      variables: { organizationId: '1' },
    },
    result: {
      data: {
        bspBalance: '{"balance":10.379}',
      },
    },
  },
];

export const walletBalanceQuery = [
  {
    request: {
      query: BSPBALANCE,
      variables: { organizationId: '1' },
    },
    result: {
      data: {
        bspbalance: '{"balance":0.628}',
      },
    },
  },
  {
    request: {
      query: BSPBALANCE,
      variables: { organizationId: null },
    },
    result: {
      data: {
        bspbalance: '{"balance":0.628}',
      },
    },
  },
];

export const walletBalanceHighQuery = [
  {
    request: {
      query: BSPBALANCE,
      variables: { organizationId: '1' },
    },
    result: {
      data: {
        bspbalance: '{"balance":10.379}',
      },
    },
  },
  {
    request: {
      query: BSPBALANCE,
      variables: { organizationId: null },
    },
    result: {
      data: {
        bspbalance: '{"balance":10.379}',
      },
    },
  },
];

export const errorBalanceQuery = [
  {
    request: {
      query: BSPBALANCE,
      variables: { organizationId: null },
    },
    error: new Error('An error occured'),
  },
];

export const walletBalanceNull = [
  {
    request: {
      query: BSPBALANCE,
      variables: { organizationId: '1' },
    },
    result: {
      data: {
        bspbalance: '{"balance":null}',
      },
    },
  },
  {
    request: {
      query: BSPBALANCE,
      variables: { organizationId: null },
    },
    result: {
      data: {
        bspbalance: '{"balance":null}',
      },
    },
  },
  {
    request: {
      query: BSP_BALANCE_SUBSCRIPTION,
      variables: { organizationId: null },
    },
    result: {
      data: {
        bspBalance: '{"balance":null}',
      },
    },
  },
];

export const getAllOrganizations = [
  {
    request: {
      query: GET_ORGANIZATION_COUNT,
      variables: { filter: {} },
    },
    result: {
      data: {
        countOrganizations: 2,
      },
    },
  },
  {
    request: {
      query: FILTER_ORGANIZATIONS,
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
        organizations: [
          {
            id: '2',
            insertedAt: '2021-04-28T05:19:51Z',
            status: 'READY_TO_DELETE',
            name: 'Foogle',
            __typename: 'Organization',
          },
          {
            id: '1',
            insertedAt: '2021-04-28T05:06:30Z',
            status: 'ACTIVE',
            name: 'Glific',
          },
          {
            id: '3',
            insertedAt: '2021-04-28T05:06:30Z',
            status: 'APPROVED',
            name: 'Test',
          },
        ],
      },
    },
  },
];

export const getOrganizationBSP = {
  request: {
    query: GET_ORGANIZATION_PROVIDER,
  },
  result: {
    data: {
      organization: {
        organization: {
          bsp: { shortcode: 'gupshup_enterprise' },
        },
      },
    },
  },
};
