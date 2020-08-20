import { gql } from '@apollo/client';

export const CONTACT_SEARCH_QUERY = gql`
  query contacts($filter: ContactFilter!, $opts: Opts!) {
    contacts(filter: $filter, opts: $opts) {
      id
      name
      phone
    }
  }
`;

export const GET_CONTACT_COUNT = gql`
  query countContacts($filter: ContactFilter!) {
    countContacts(filter: $filter)
  }
`;
