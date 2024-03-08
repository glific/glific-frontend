import { GET_TAG, FILTER_TAGS, GET_TAGS, GET_TAG_COUNT } from 'graphql/queries/Tags';

export const getTagQuery = {
  request: {
    query: GET_TAG,
    variables: {
      id: 13,
    },
  },

  result: {
    data: {
      tag: {
        __typename: 'TagResult',
        tag: {
          __typename: 'Tag',
          colorCode: '#0C976D',
          description: 'Marking message as an affirmative response',
          id: '13',
          insertedAt: '2023-07-26T07:31:31Z',
          isActive: true,
          isReserved: true,
          keywords: ['yes', 'yeah', 'okay', 'ok'],
          label: 'Yes',
          language: {
            __typename: 'Language',
            id: '1',
            label: 'English',
          },
          parent: null,
          shortcode: 'yes',
          updatedAt: '2023-07-26T07:31:31Z',
        },
      },
    },
  },
};

export const filterTagQuery = {
  request: {
    query: FILTER_TAGS,
    variables: {
      opts: {
        order: 'ASC',
        offset: 0,
        limit: 50,
        orderWith: 'label',
      },
      filter: {},
    },
  },

  result: {
    data: {
      tags: [
        {
          __typename: 'Tag',
          colorCode: '#0C976D',
          description: 'Marking message sent from a member of staff',
          id: '18',
          insertedAt: '2023-07-26T07:31:31Z',
          isActive: true,
          isReserved: true,
          keywords: null,
          language: {
            id: '1',
            label: 'English',
          },
          label: 'Staff',
          shortcode: 'staff',
          updatedAt: '2023-07-26T07:31:31Z',
        },
      ],
    },
  },
};

export const getFilterTagQuery = {
  request: {
    query: GET_TAGS,
    variables: {},
  },
  result: {
    data: {
      tags: [
        {
          __typename: 'Tag',
          id: '1',
          label: 'Messages',
        },
        {
          __typename: 'Tag',
          id: '2',
          label: 'Contacts',
        },
      ],
    },
  },
};

export const countTagQuery = {
  request: {
    query: GET_TAG_COUNT,
    variables: { filter: {} },
  },
  result: {
    data: {
      countTags: 1,
    },
  },
};
