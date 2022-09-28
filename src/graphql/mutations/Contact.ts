import { gql } from '@apollo/client';

export const DELETE_CONTACT = gql`
  mutation deleteContact($id: ID!) {
    deleteContact(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_CONTACT = gql`
  mutation createContact($input: ContactInput!) {
    createContact(input: $input) {
      contact {
        id
        name
        phone
        language {
          id
          label
        }
      }
    }
  }
`;

export const UPDATE_CONTACT = gql`
  mutation updateContact($id: ID!, $input: ContactInput!) {
    updateContact(id: $id, input: $input) {
      contact {
        id
        name
        phone
        language {
          id
          label
        }
      }
    }
  }
`;

export const UPDATE_CONTACT_TAGS = gql`
  mutation updateContactTags($input: ContactTagsInput!) {
    updateContactTags(input: $input) {
      contactTags {
        id
      }
    }
  }
`;

export const IMPORT_CONTACTS = gql`
  mutation ImportContacts(
    $data: String!
    $groupLabel: String
    $importContactsId: ID
    $type: ImportContactsTypeEnum
  ) {
    importContacts(data: $data, groupLabel: $groupLabel, id: $importContactsId, type: $type) {
      status
      errors {
        message
      }
    }
  }
`;
