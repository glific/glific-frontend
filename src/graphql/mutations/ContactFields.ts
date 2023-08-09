import { gql } from '@apollo/client';

export const CREATE_CONTACT_FIELDS = gql`
  mutation createContactsField($input: ContactsFieldInput!) {
    createContactsField(input: $input) {
      contactsField {
        variable
        valueType
        updatedAt
        shortcode
        scope
        name
        insertedAt
        id
        organization {
          shortcode
          isApproved
          isActive
        }
      }
      errors {
        message
        key
      }
    }
  }
`;

export const UPDATE_CONTACT_FIELDS = gql`
  mutation updateContactsField($id: ID!, $input: ContactsFieldInput!) {
    updateContactsField(id: $id, input: $input) {
      contactsField {
        valueType
        updatedAt
        shortcode
        scope
        name
        insertedAt
        id
        organization {
          shortcode
          isApproved
          isActive
        }
      }
      errors {
        message
        key
      }
    }
  }
`;

export const DELETE_CONTACT_FIELDS = gql`
  mutation deleteContactsField($id: ID!, $deleteAssoc: Boolean) {
    deleteContactsField(id: $id, deleteAssoc: $deleteAssoc) {
      contactsField {
        valueType
        updatedAt
        shortcode
        scope
        name
        insertedAt
        id
        organization {
          shortcode
          isApproved
          isActive
        }
      }
      errors {
        message
        key
      }
    }
  }
`;
