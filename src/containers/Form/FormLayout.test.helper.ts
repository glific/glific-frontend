import { GET_TAG, GET_TAGS, GET_TAGS_COUNT, FILTER_TAGS } from '../../graphql/queries/Tag';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import { CREATE_TAG, DELETE_TAG, UPDATE_TAG } from '../../graphql/mutations/Tag';
import { Input } from '../../components/UI/Form/Input/Input';

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
  icon: null,
};

export const getLanguagesQuery = {
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
            id: '121',
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
            id: '121',
            description: 'new Tag description',
            label: 'new Tag',
            colorCode: '#0C976D',
            parent: {
              id: '1',
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
        filter: {
          label: '',
        },
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
        tags: [
          {
            id: '87',
            label: 'Important',
            keywords: ['Hi'],
            description: 'important task',
            isReserved: false,
            colorCode: '#0C976D',
            parent: { id: '1' },
          },
          {
            id: '94',
            label: 'To Do',
            keywords: ['Hi'],
            description: 'complete this task',
            isReserved: false,
            colorCode: '#0C976D',
            parent: { id: '2' },
          },
        ],
      },
    },
  },
  getLanguagesQuery,
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
      variables: {},
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
          },
        ],
      },
    },
  },
];
