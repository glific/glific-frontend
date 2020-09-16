import { CREATE_COLLECTION } from '../graphql/mutations/Collection';
import { COLLECTION_QUERY, COLLECTION_QUERY_COUNT } from '../graphql/queries/Collection';

export const createCollectionQuery = {
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
};

export const countCollectionsQuery = {
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
};

export const getCollectionsQuery = {
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
};
