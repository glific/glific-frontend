import { GET_AUTOMATIONS } from '../../graphql/queries/Automation';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import {
  getOrganizationLanguagesQuery,
  getOrganizationQuery,
  getProvidersQuery,
  getCredential,
} from '../../mocks/Organization';
import { setVariables } from '../../common/constants';

export const LIST_ITEM_MOCKS = [
  {
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
  },
  {
    request: {
      query: GET_LANGUAGES,
      variables: {},
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
      variables: setVariables(),
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
            id: '10',
            name: 'SoL Feedback',
            uuid: '6c21af89-d7de-49ac-9848-c9febbf737a5',
          },
        ],
      },
    },
  },
  ...getOrganizationQuery,
  ...getProvidersQuery,
  ...getCredential,
  getOrganizationLanguagesQuery,
];
