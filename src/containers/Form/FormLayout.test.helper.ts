import { GET_TAG, GET_TAGS, GET_TAGS_COUNT, FILTER_TAGS } from '../../graphql/queries/Tag';
import { CREATE_TAG, DELETE_TAG, UPDATE_TAG } from '../../graphql/mutations/Tag';
import { Input } from '../../components/UI/Form/Input/Input';
import { getTagsQuery } from '../../mocks/Tag';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from '../../mocks/Organization';
import { setVariables } from '../../common/constants';
import * as Yup from 'yup';

const FormSchema = Yup.object();

export const listItemProps = {
  deleteItemQuery: DELETE_TAG,
  states: {
    label: 'important',
    description: 'important label',
  },
  setStates: jest.fn(),
  setValidation: jest.fn(),
  listItemName: 'tag',
  dialogMessage: 'Are you sure?',
  formFields: [
    {
      component: Input,
      name: 'label',
      type: 'text',
      placeholder: 'Item title',
    },
  ],
  redirectionLink: 'tag',
  listItem: 'tag',
  getItemQuery: GET_TAG,
  createItemQuery: CREATE_TAG,
  updateItemQuery: UPDATE_TAG,
  validationSchema: FormSchema,
  icon: null,
  getLanguageId: Function,
};

export const LIST_ITEM_MOCKS = [
  {
    request: {
      query: CREATE_TAG,
      variables: {
        input: {
          label: 'important',
          description: 'important label',
          languageId: 1,
          colorCode: '#0C976D',
          parentId: '1',
        },
      },
    },
    result: {
      data: {
        createTag: {
          tag: {
            id: '3',
            description: 'important label',
            label: 'important',
            colorCode: '#0C976D',
            parent: { id: '1' },
          },
        },
      },
    },
  },
  {
    request: {
      query: CREATE_TAG,
      variables: {
        input: {
          label: 'new Tag',
          description: 'new Tag description',
          keywords: '',
          languageId: 1,
          colorCode: '#0C976D',
          parentId: '1',
        },
      },
    },
    result: {
      data: {
        createTag: {
          tag: {
            id: '4',
            description: 'new Tag description',
            label: 'new Tag',
            colorCode: '#0C976D',
            parent: {
              id: '2',
            },
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_TAGS_COUNT,
      variables: {
        filter: {},
      },
    },
    result: {
      data: {
        countTags: 2,
      },
    },
  },
  {
    request: {
      query: FILTER_TAGS,
      variables: {
        filter: {},
        opts: {
          limit: 50,
          offset: 0,
          order: 'ASC',
          orderWith: 'label',
        },
      },
    },
    result: {
      data: {
        tags: [
          {
            id: '2',
            label: 'Important',
            keywords: ['Hi'],
            description: 'important task',
            isReserved: false,
            colorCode: '#0C976D',
            parent: { id: '1' },
            updatedAt: '2020-12-01T18:00:28Z',
          },
          {
            id: '1',
            label: 'To Do',
            keywords: ['Hi'],
            description: 'complete this task',
            isReserved: false,
            colorCode: '#0C976D',
            parent: { id: '2' },
            updatedAt: '2020-12-01T18:00:28Z',
          },
        ],
      },
    },
  },
  {
    request: {
      query: GET_TAG,
      variables: {
        id: 1,
      },
    },
    result: {
      data: {
        tag: {
          tag: {
            id: 1,
            label: 'important',
            description: 'important label',
            keywords: ['hi'],
            language: {
              id: 1,
            },
            colorCode: '#00d084',
            parent: { id: '2' },
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_TAG,
      variables: {},
    },
    result: {
      data: {
        tag: {
          tag: {
            id: 1,
            label: 'important',
            description: 'important label',
            keywords: ['hi'],
            language: {
              id: 1,
            },
            colorCode: '#00d084',
            parent: { id: '2' },
          },
        },
      },
    },
  },
  {
    request: {
      query: GET_TAG,
      variables: {},
    },
    result: {
      data: {
        tag: {
          tag: {
            id: 1,
            label: 'important',
            description: 'important label',
            keywords: ['hi'],
            language: {
              id: 1,
            },
            colorCode: '#00d084',
            parent: {
              id: '2',
            },
          },
        },
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
      query: GET_TAGS,
      variables: { filter: { label: 'new Tag', languageId: 1 } },
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
  getTagsQuery,
  ...getOrganizationQuery,
  getOrganizationLanguagesQuery,
];
