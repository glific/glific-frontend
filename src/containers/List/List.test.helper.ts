import { GET_TAGS_COUNT, FILTER_TAGS, GET_TAGS } from '../../graphql/queries/Tag';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import { DELETE_TAG } from '../../graphql/mutations/Tag';
import { GET_ORGANIZATION } from '../../graphql/queries/Organization';

export const defaultProps = {
  columnNames: ['label', 'description', 'keywords', 'actions'],
  countQuery: GET_TAGS_COUNT,
  listItem: 'tags',
  filterItemsQuery: FILTER_TAGS,
  deleteItemQuery: DELETE_TAG,
  listItemName: 'tag',
  dialogMessage: 'are you sure?',
  pageLink: 'tag',
  columns: jest.fn(),
  listIcon: null,
  columnStyles: [],
  title: 'Tags',
};

const count = {
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
};

const filter = {
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
          label: 'Unread',
          description: 'Unread',
          keywords: ['Hi'],
          isReserved: false,
          colorCode: '#0C976D',
          parent: null,
        },
        {
          id: '88',
          label: 'Not replied',
          description: 'Not replied',
          keywords: null,
          isReserved: true,
          colorCode: '#0C976D',
          parent: null,
        },
      ],
    },
  },
};

const search = {
  request: {
    query: FILTER_TAGS,
    variables: {
      filter: {
        label: 'Unread',
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
          label: 'Unread',
          description: 'Unread',
          keywords: ['Hi'],
          isReserved: false,
          colorCode: '#0C976D',
          parent: null,
        },
      ],
    },
  },
};

const searchCount = {
  request: {
    query: GET_TAGS_COUNT,
    variables: {
      filter: {
        label: 'Unread',
      },
    },
  },
  result: {
    data: {
      countTags: 2,
    },
  },
};

const getTags = {
  request: {
    query: GET_TAGS,
    variables: {},
  },
  result: {
    data: {
      tags: [
        {
          colorCode: '#0C976D',
          description: 'A default message tag',
          id: '1',
          label: 'Messages',
          parent: null,
          language: { id: '1', label: 'Hindi' },
        },
        {
          colorCode: '#0C976D',
          description: 'A contact tag for users that are marked as contacts',
          id: '2',
          label: 'Contacts',
          parent: null,
          language: { id: '1', label: 'Hindi' },
        },
      ],
    },
  },
};

export const LIST_MOCKS = [
  {
    request: {
      query: DELETE_TAG,
      variables: {
        id: '87',
      },
    },
    result: {
      data: {
        deleteTag: {
          errors: null,
        },
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
  count,
  count,
  filter,
  filter,
  search,
  searchCount,
  getTags,
  {
    request: {
      query: GET_ORGANIZATION,
    },
    result: {
      data: {
        organization: {
          organization: {
            defaultLanguage: { id: '2', label: 'English (United States)' },
            activeLanguages: [
              {
                id: '2',
                label: 'English (United States)',
              },
            ],
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
            providerAppname: 'ADD_PROVIDER_API_KEY',
            providerPhone: '917834811114',
            name: 'Glific',
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
            activeLanguages: [
              {
                id: '2',
                label: 'English (United States)',
              },
            ],
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
            providerAppname: 'ADD_PROVIDER_API_KEY',
            providerPhone: '917834811114',
            name: 'Glific',
          },
        },
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
            activeLanguages: [
              {
                id: '2',
                label: 'English (United States)',
              },
            ],
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
            providerAppname: 'ADD_PROVIDER_API_KEY',
            providerPhone: '917834811114',
            name: 'Glific',
          },
        },
      },
    },
  }
];
