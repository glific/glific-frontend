import { GET_TAGS_COUNT, FILTER_TAGS, GET_TAGS } from 'graphql/queries/Tag';
import { FILTER_ORGANIZATIONS, GET_ORGANIZATION_COUNT } from 'graphql/queries/Organization';
import { GET_LANGUAGES } from 'graphql/queries/List';
import { DELETE_TAG } from 'graphql/mutations/Tag';
import { DELETE_INACTIVE_ORGANIZATIONS } from 'graphql/mutations/Organization';
import {
  getOrganizationLanguagesQuery,
  getOrganizationQuery,
  getAllOrganizations,
} from 'mocks/Organization';
import { setVariables } from 'common/constants';

export const defaultProps = {
  columnNames: ['LABEL', 'DESCRIPTION', 'KEYWORDS', 'ACTIONS'],
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
  searchMode: true,
};

const count = {
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
};

const filter = {
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
          id: '87',
          label: 'Unread',
          description: 'Unread',
          keywords: ['Hi'],
          isReserved: false,
          colorCode: '#0C976D',
          parent: null,
          updatedAt: '2020-12-01T18:00:28Z',
        },
        {
          id: '88',
          label: 'Not replied',
          description: 'Not replied',
          keywords: null,
          isReserved: true,
          colorCode: '#0C976D',
          parent: null,
          updatedAt: '2020-12-01T18:00:28Z',
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
          id: '87',
          label: 'Unread',
          description: 'Unread',
          keywords: ['Hi'],
          isReserved: false,
          colorCode: '#0C976D',
          parent: null,
          updatedAt: '2020-12-01T18:00:28Z',
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
  filter,
  filter,
  search,
  searchCount,
  getTags,
  ...getOrganizationQuery,
  getOrganizationLanguagesQuery,
];

export const ORG_LIST_MOCK = [...getAllOrganizations];

export const orgProps = {
  columnNames: ['NAME', 'IS ACTIVE', 'IS APPROVED', 'ACTIONS'],
  countQuery: GET_ORGANIZATION_COUNT,
  listItem: 'organizations',
  filterItemsQuery: FILTER_ORGANIZATIONS,
  deleteItemQuery: DELETE_INACTIVE_ORGANIZATIONS,
  listItemName: 'organization',
  pageLink: 'organization',
  columns: jest.fn(),
  listIcon: null,
  columnStyles: [],
  title: 'Organizations',
  searchMode: true,
};
