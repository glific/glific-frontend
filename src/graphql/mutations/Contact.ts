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

export const MOVE_CONTACTS = gql`
  mutation MoveContacts($data: String!, $moveContactsId: ID, $type: ImportContactsTypeEnum) {
    moveContacts(data: $data, id: $moveContactsId, type: $type) {
      errors {
        message
        key
      }
      csvRows
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

export const DELETE_CONTACT_PROFILE = gql`
  mutation deleteProfile($id: ID!) {
    deleteProfile(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;
