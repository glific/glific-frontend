import { gql } from '@apollo/client';

export const COLLECTION_QUERY = gql`
  query savedSearches($filter: SavedSearchFilters!, $opts: SavedSearchOpts!) {
    savedSearches(filter: $filter, opts: $opts) {
      id
      shortcode
      label
      args
      count
    }
  }
`;

export const COLLECTION_QUERY_COUNT = gql`
  query countSavedSearches($filter: SavedSearchFilter!) {
    countSavedSearches(filter: $filter)
  }
`;

export const GET_COLLECTION = gql`
  query savedSearches($id: ID) {
    savedSearch(id: $id) {
      savedSearch {
        id
        shortcode
        label
        args
        count
      }
    }
  }
`;
