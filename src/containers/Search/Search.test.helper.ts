import { GET_COLLECTIONS } from 'graphql/queries/Collection';
import { FILTER_TAGS_NAME, GET_TAGS } from 'graphql/queries/Tag';
import { GET_LANGUAGES } from 'graphql/queries/List';
import { GET_USERS } from 'graphql/queries/User';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from 'mocks/Organization';
import { createSearchQuery, countSearchesQuery, getSearchesQuery, getSearch } from 'mocks/Search';
import { setVariables } from 'common/constants';

export const LIST_ITEM_MOCKS = [
  createSearchQuery,
  countSearchesQuery,
  countSearchesQuery,
  ...getSearchesQuery,
  getSearch,
  {
    request: {
      query: GET_COLLECTIONS,
      variables: setVariables(),
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
  },
  {
    request: {
      query: FILTER_TAGS_NAME,
      variables: setVariables(),
    },
    result: {
      data: {
        tags: [
          {
            id: '1',
            label: 'Messages',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_TAGS,
      variables: setVariables(),
    },
    result: {
      data: {
        tags: [
          {
            id: '1',
            label: 'Messages',
            description: null,
            colorCode: '#0C976D',
            parent: { id: '2' },
            language: { id: '1', label: 'Hindi' },
          },
        ],
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
      query: GET_USERS,
      variables: setVariables(),
    },
    result: {
      data: {
        users: [{ __typename: 'User', id: '1', name: 'Glific Admin' }],
      },
    },
  },
  ...getOrganizationQuery,
  getOrganizationLanguagesQuery,
];
