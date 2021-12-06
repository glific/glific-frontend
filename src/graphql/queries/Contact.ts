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
        tags {
          id
          label
        }
      }
    }
  }
`;

export const GET_CONTACT_DETAILS = gql`
  query getContact($id: ID!) {
    contact(id: $id) {
      contact {
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
  query getContact($id: ID!) {
    contact(id: $id) {
      contact {
        history {
          eventDatetime
          eventLabel
          eventMeta
          eventType
          id
          insertedAt
          updatedAt
        }
      }
    }
  }
`;
