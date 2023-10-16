import { gql } from '@apollo/client';

export const CONTACT_SEARCH_QUERY = gql`
  query contacts($filter: ContactFilter!, $opts: Opts!) {
    contacts(filter: $filter, opts: $opts) {
      id
      name
      phone
      maskedPhone
      groups {
        id
        label
      }
      status
    }
  }
`;

export const GET_CONTACT_COUNT = gql`
  query countContacts($filter: ContactFilter!) {
    countContacts(filter: $filter)
  }
`;

export const GET_CONTACT_COLLECTIONS = gql`
  query contact($id: ID!) {
    contact(id: $id) {
      contact {
        groups {
          id
          label
          users {
            name
          }
        }
      }
    }
  }
`;

export const GET_COLLECTION_CONTACTS = gql`
  query group($id: ID!) {
    group(id: $id) {
      group {
        contacts {
          id
          name
          phone
        }
      }
    }
  }
`;

export const GET_CONTACTS = gql`
  {
    contacts {
      id
      name
    }
  }
`;

export const GET_CONTACT = gql`
  query getContact($id: ID!) {
    contact(id: $id) {
      contact {
        id
        name
        phone
        language {
          id
          label
        }
        groups {
          id
          label
          users {
            name
          }
        }
        status
        bspStatus
        settings
        fields
      }
    }
  }
`;

export const GET_CONTACT_DETAILS = gql`
  query getContact($id: ID!) {
    contact(id: $id) {
      contact {
        activeProfile {
          id
        }
        phone
        maskedPhone
        status
        lastMessageAt
        groups {
          id
          label
          users {
            name
          }
        }
        fields
        optinTime
        optoutTime
        optinMethod
        optoutMethod
        settings
      }
    }
  }
`;

export const GET_CONTACT_HISTORY = gql`
  query ContactHistory($filter: ContactsHistoryFilter, $opts: Opts) {
    contactHistory(filter: $filter, opts: $opts) {
      eventDatetime
      eventLabel
      eventMeta
      eventType
      insertedAt
      updatedAt
    }
  }
`;

export const COUNT_CONTACT_HISTORY = gql`
  query CountContactHistory($filter: ContactsHistoryFilter) {
    countContactHistory(filter: $filter)
  }
`;

export const GET_CONTACT_PROFILES = gql`
  query Profiles($filter: ProfileFilter) {
    profiles(filter: $filter) {
      fields
      id
      name
      type
      language {
        id
      }
    }
  }
`;
