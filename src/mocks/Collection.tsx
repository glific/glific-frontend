import { CREATE_SEARCH } from '../graphql/mutations/Search';
import {
  COLLECTION_QUERY,
  COLLECTION_QUERY_COUNT,
  GET_COLLECTION,
} from '../graphql/queries/Collection';

export const createCollectionQuery = {
  request: {
    query: CREATE_SEARCH,
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
};

export const countCollectionsQuery = {
  request: {
    query: COLLECTION_QUERY_COUNT,
    variables: {
      filter: {},
    },
  },
  result: {
    data: {
      countTags: 1,
    },
  },
};

const collectionQuery = (QUERY: any, filter: any, limit: number, offset: number, order: string) => {
  return {
    query: COLLECTION_QUERY,
    variables: {
      filter: filter,
      opts: {
        limit: limit,
        offset: offset,
        order: order,
      },
    },
  };
};

export const getCollectionsQuery = [
  {
    request: collectionQuery(COLLECTION_QUERY, {}, 10, 0, 'ASC'),
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
    request: collectionQuery(COLLECTION_QUERY, {}, 100, 0, 'ASC'),
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
];

export const getCollection = {
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
};
