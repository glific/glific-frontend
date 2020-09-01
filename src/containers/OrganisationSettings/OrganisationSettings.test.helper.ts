import { GET_AUTOMATIONS } from '../../graphql/queries/Automation';
import { GET_ORGANIZATION, GET_ORGANIZATIONS } from '../../graphql/queries/Organization';
import { GET_LANGUAGES } from '../../graphql/queries/List';

export const LIST_ITEM_MOCKS = [
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
      query: GET_AUTOMATIONS,
      variables: {},
    },
    result: {
      data: {
        flows: [
          {
            __typename: 'Flow',
            id: '1',
            name: 'Help Workflow',
            shortcode: 'help',
            uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
          },
          {
            __typename: 'Flow',
            id: '10',
            name: 'SoL Feedback',
            shortcode: 'solfeedback',
            uuid: '6c21af89-d7de-49ac-9848-c9febbf737a5',
          },
        ],
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
            providerKey: 'ADD_PROVIDER_API_KEY',
            providerPhone: '917834811114',
            shortcode: 'Glific',
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
            providerKey: 'ADD_PROVIDER_API_KEY',
            providerPhone: '917834811114',
            shortcode: 'Glific',
          },
        },
      },
    },
  },
];
