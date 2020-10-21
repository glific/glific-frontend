import { GET_TAGS_COUNT, FILTER_TAGS, GET_TAGS } from '../../graphql/queries/Tag';
import { GET_LANGUAGES } from '../../graphql/queries/List';
import { DELETE_TAG } from '../../graphql/mutations/Tag';
import { getOrganizationLanguagesQuery, getOrganizationQuery } from '../../mocks/Organization';
import { setVariables } from '../../common/constants';

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
    variables: setVariables(),
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
  ...getOrganizationQuery,
  getOrganizationLanguagesQuery,
];
