import { GET_SEARCH } from '../../graphql/queries/Search';
import { CREATE_SEARCH, DELETE_SEARCH, UPDATE_SEARCH } from '../../graphql/mutations/Search';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_GROUPS } from '../../graphql/queries/Group';
import { FILTER_TAGS_NAME, GET_TAGS } from '../../graphql/queries/Tag';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import { GET_USERS } from '../../graphql/queries/User';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from '../../mocks/Organization';
import {
  createCollectionQuery,
  countCollectionsQuery,
  getCollectionsQuery,
  getCollection,
} from '../../mocks/Search';
import { setVariables } from '../../common/constants';

export const listItemProps = {
  deleteItemQuery: DELETE_SEARCH,
  states: {
    label: 'important',
    description: 'important label',
  },
  setStates: jest.fn(),
  setValidation: jest.fn(),
  listItemName: 'collection',
  dialogMessage: 'Are you sure?',
  formFields: [
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: 'Item title',
    },
  ],
  redirectionLink: 'collection',
  listItem: 'collection',
  getItemQuery: GET_SEARCH,
  createItemQuery: CREATE_SEARCH,
  updateItemQuery: UPDATE_SEARCH,
  icon: null,
};

export const LIST_ITEM_MOCKS = [
  createCollectionQuery,
  countCollectionsQuery,
  countCollectionsQuery,
  ...getCollectionsQuery,
  getCollection,
  {
    request: {
      query: GET_GROUPS,
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
