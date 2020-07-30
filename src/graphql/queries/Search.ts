import { gql } from '@apollo/client';

export const SEARCH_QUERY = gql`
  query search($term: String!, $messageOpts: Opts!, $contactOpts: Opts!, $filter: SearchFilter) {
    search(term: $term, messageOpts: $messageOpts, contactOpts: $contactOpts, filter: $filter) {
      contact {
        id
        name
        phone
      }
      messages {
        id
        body
        insertedAt
        receiver {
          id
        }
        sender {
          id
        }
        tags {
          id
          label
        }
      }
    }
  }
`;

export const SAVED_SEARCH_QUERY = gql`
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
