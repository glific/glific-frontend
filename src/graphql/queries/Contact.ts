import { gql } from '@apollo/client';

export const CONTACT_SEARCH_QUERY = gql`
  query searchContacts($filter: SearchContactsFilter!, $opts: Opts!) {
    searchContacts(filter: $filter, opts: $opts) {
      id
      name
      phone
    }
  }
`;
