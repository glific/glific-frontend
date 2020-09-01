import {
  COLLECTION_QUERY,
  GET_COLLECTION,
  COLLECTION_QUERY_COUNT,
} from '../../graphql/queries/Collection';
import {
  CREATE_COLLECTION,
  DELETE_COLLECTION,
  UPDATE_COLLECTION,
} from '../../graphql/mutations/Collection';
import { Input } from '../../components/UI/Form/Input/Input';
import { GET_GROUPS } from '../../graphql/queries/Group';
import { GET_TAGS } from '../../graphql/queries/Tag';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import { GET_USERS } from '../../graphql/queries/User';

export const listItemProps = {
  deleteItemQuery: DELETE_COLLECTION,
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
  getItemQuery: GET_COLLECTION,
  createItemQuery: CREATE_COLLECTION,
  updateItemQuery: UPDATE_COLLECTION,
  icon: null,
};

export const LIST_ITEM_MOCKS = [
  {
    request: {
      query: CREATE_COLLECTION,
      variables: {
        input: {
          label: 'new Collection description',
          shortcode: 'new Collection',
          args:
            '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeTags":["10"]},"contactOpts":{"offset":0,"limit":20}}',
        },
      },
    },
    result: {
      data: {
        createSavedSearch: {
          errors: null,
          savedSearch: {
            args:
              '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeTags":["10"]},"contactOpts":{"offset":0,"limit":20}}',
            id: '11',
            label: 'new Collection description',
            shortcode: 'new Collection',
          },
        },
      },
    },
  },
  {
    request: {
      query: COLLECTION_QUERY_COUNT,
      variables: {
        filter: { label: '' },
      },
    },
    result: {
      data: {
        countTags: 1,
      },
    },
  },
  {
    request: {
      query: COLLECTION_QUERY,
      variables: {
        filter: {
          label: '',
        },
        opts: {
          limit: 10,
          offset: 0,
          order: 'ASC',
        },
      },
    },
    result: {
      data: {
        savedSearches: [
          {
            count: 4,
            args:
              '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeTags":["10"]},"contactOpts":{"offset":0,"limit":20}}',
            id: '8',
            label: 'Test collection',
            shortcode: 'Save Search collection',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_COLLECTION,
      variables: {
        id: 1,
      },
    },
    result: {
      data: {
        savedSearch: {
          savedSearch: {
            args:
              '{"messageOpts":{"offset":0,"limit":10},"filter":{"term":"","includeTags":["10"]},"contactOpts":{"offset":0,"limit":20}}',
            count: 0,
            id: '1',
            label: 'Test collection',
            shortcode: 'Save Search collection',
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_GROUPS,
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
      query: GET_TAGS,
    },
    result: {
      data: {
        tags: [
          {
            id: '1',
            label: 'Messages',
            description: null,
            colorCode: '#0C976D',
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
    },
    result: {
      data: {
        users: [{ __typename: 'User', id: '1', name: 'Glific Admin' }],
      },
    },
  },
];
