import { GET_FLOWS } from '../../graphql/queries/Flow';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import {
  getOrganizationLanguagesQuery,
  getOrganizationQuery,
  getProvidersQuery,
  getOrganisationSettings,
  getCredential,
} from '../../mocks/Organization';
import { FLOW_STATUS_PUBLISHED, setVariables } from '../../common/constants';

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
  getOrganisationSettings,
  getOrganizationLanguagesQuery,
];
