import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import { GET_LANGUAGES } from 'graphql/queries/List';
import { GET_USERS } from 'graphql/queries/User';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { createSearchQuery, countSearchesQuery, getSearchesQuery, getSearch } from 'mocks/Search';
import { setVariables } from 'common/constants';
import { GET_ALL_FLOW_LABELS } from 'graphql/queries/FlowLabel';

const getCollectionMock = (variables: any) => ({
  request: {
    query: GET_COLLECTIONS,
    variables: variables,
  },
  result: {
    data: {
      groups: [
        {
          id: '1',
          isRestricted: false,
          label: 'Group 1',
        },
      ],
    },
  },
});

export const LIST_ITEM_MOCKS = [
  createSearchQuery,
  countSearchesQuery,
  countSearchesQuery,
  ...getSearchesQuery,
  getSearch,
  getCollectionMock(setVariables()),
  getCollectionMock(setVariables({ groupType: 'WA' })),
  getCollectionMock(setVariables({ groupType: 'WABA' })),
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
      query: GET_USERS,
      variables: setVariables(),
    },
    result: {
      data: {
        users: [{ __typename: 'User', id: '1', name: 'Glific Admin' }],
      },
    },
  },
  {
    request: {
      query: GET_ALL_FLOW_LABELS,
      variables: setVariables(),
    },
    result: {
      data: {
        flowLabels: [
          {
            id: '1',
            name: 'Label 1',
          },
          {
            id: '2',
            name: 'Label 2',
          },
        ],
      },
    },
  },
  ...getOrganizationQuery,
  getOrganizationLanguagesQuery,
];
