import { gql } from '@apollo/client';

export const SEARCH_QUERY = gql`
  query search($filter: SearchFilter!, $contactOpts: Opts!, $messageOpts: Opts!) {
    search(filter: $filter, contactOpts: $contactOpts, messageOpts: $messageOpts) {
      contact {
        id
        name
        phone
        lastMessageAt
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
