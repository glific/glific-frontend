import { GET_FLOWS } from 'graphql/queries/Flow';
import { GET_LANGUAGES } from 'graphql/queries/List';
import {
  getOrganizationLanguagesQuery,
  getOrganizationQuery,
  getProvidersQuery,
  getOrganizationSettings,
  getCredential,
  getQualityRating,
  getMaytapiProvider,
} from 'mocks/Organization';
import { FLOW_STATUS_PUBLISHED, setVariables } from 'common/constants';
import { UPDATE_ORGANIZATION } from 'graphql/mutations/Organization';
import { getRoleNamesMock } from 'containers/StaffManagement/StaffManagement.test.helper';

const languageMock = {
  request: {
    query: GET_LANGUAGES,
    variables: { opts: { order: 'ASC' } },
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
};

const flowsMock = {
  request: {
    query: GET_FLOWS,
    variables: setVariables({ status: FLOW_STATUS_PUBLISHED }),
  },
  result: {
    data: {
      flows: [
        {
          id: '1',
          name: 'Help Workflow',
          uuid: '3fa22108-f464-41e5-81d9-d8a298854429',
        },
        {
          id: '2',
          name: 'SoL Feedback',
          uuid: '6c21af89-d7de-49ac-9848-c9febbf737a5',
        },
      ],
    },
  },
};

export const LIST_ITEM_MOCKS = [
  getRoleNamesMock,
  languageMock,
  languageMock,
  flowsMock,
  ...getOrganizationQuery,
  ...getProvidersQuery,
  ...getCredential,
  getOrganizationSettings,
  getOrganizationLanguagesQuery,
  ...getMaytapiProvider,
];

const updateOrganizationMock = {
  request: {
    query: UPDATE_ORGANIZATION,
    variables: {
      id: '1',
      input: {
        activeLanguageIds: ['1', '2'],
        defaultLanguageId: '1',
        name: 'Glific',
        signaturePhrase: 'Please change me, NOW!',
        defaultFlowId: '7',
        enabled: true,
        enabledDays: [
          { id: 1, enabled: true },
          { id: 2, enabled: true },
          { id: 3, enabled: true },
          { id: 4, enabled: true },
          { id: 5, enabled: true },
          { id: 6, enabled: true },
          { id: 7, enabled: true },
        ],
        endTime: '20:00:00',
        flowId: null,
        startTime: '09:00:00',
        setting: {
          lowBalanceThreshold: '10',
          criticalBalanceThreshold: '5',
          sendWarningMail: false,
        },
      },
    },
  },
  result: {
    data: {
      updateOrganization: {
        errors: null,
        organization: {
          activeLanguages: [
            {
              id: '1',
              label: 'Engrlish',
            },
            {
              id: '2',
              label: 'Hindi',
            },
          ],
          defaultLanguage: {
            id: '1',
            label: 'English',
          },
          id: '1',
          name: 'Glific',
          outOfOffice: {
            defaultFlowId: null,
            enabled: true,
            enabledDays: [
              {
                enabled: true,
                id: 1,
              },
              {
                enabled: true,
                id: 2,
              },
              {
                enabled: true,
                id: 3,
              },
              {
                enabled: true,
                id: 4,
              },
              {
                enabled: true,
                id: 5,
              },
              {
                enabled: false,
                id: 6,
              },
              {
                enabled: false,
                id: 7,
              },
            ],
            endTime: '20:00:00',
            flowId: null,
            startTime: '09:00:00',
          },
          setting: {
            criticalBalanceThreshold: '3',
            lowBalanceThreshold: '10',
            sendWarningMail: true,
          },
          shortcode: 'glific',
        },
      },
    },
  },
};

const updateOrganizationMock2 = {
  request: {
    query: UPDATE_ORGANIZATION,
    variables: {
      id: 1,
      input: {
        name: 'Glific',
        activeLanguageIds: ['1', '2'],
        signaturePhrase: 'Please change me, NOW!',
        defaultLanguageId: '1',
        setting: {
          lowBalanceThreshold: '10',
          criticalBalanceThreshold: '5',
          sendWarningMail: false,
        },
      },
    },
  },
  result: {
    data: {
      updateOrganization: {
        errors: null,
        organization: {
          activeLanguages: [
            {
              id: '1',
              label: 'English',
            },
            {
              id: '2',
              label: 'Hindi',
            },
          ],
          defaultLanguage: {
            id: '1',
            label: 'English',
          },
          id: '1',
          name: 'Glific',
          outOfOffice: {
            defaultFlowId: null,
            enabled: true,
            enabledDays: [
              {
                enabled: true,
                id: 1,
              },
              {
                enabled: true,
                id: 2,
              },
              {
                enabled: true,
                id: 3,
              },
              {
                enabled: true,
                id: 4,
              },
              {
                enabled: true,
                id: 5,
              },
              {
                enabled: false,
                id: 6,
              },
              {
                enabled: false,
                id: 7,
              },
            ],
            endTime: '20:00:00',
            flowId: null,
            startTime: '09:00:00',
          },
          setting: {
            criticalBalanceThreshold: '3',
            lowBalanceThreshold: '10',
            sendWarningMail: true,
          },
          shortcode: 'glific',
        },
      },
    },
  },
};

export const ORGANIZATION_MOCKS = [
  getRoleNamesMock,
  getQualityRating,
  languageMock,
  getOrganizationLanguagesQuery,
  flowsMock,
  ...getOrganizationQuery,
  updateOrganizationMock,
  updateOrganizationMock2,
];
