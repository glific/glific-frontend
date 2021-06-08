import { gql } from '@apollo/client';
import { CONTACT_FIELDS } from '../queries/ContactFields';

export const CREATE_CONTACT_FIELDS = gql`
  ${CONTACT_FIELDS}
  mutation createContactsField($input: ContactsFieldInput!) {
    createContactsField(input: $input) {
      contactsField {
        ...contactsFields
      }
      errors {
        message
        key
      }
    }
  }
`;

export const UPDATE_CONTACT_FIELDS = gql`
  ${CONTACT_FIELDS}
  mutation updateContactsField($id: ID!, $input: ContactsFieldInput!) {
    updateContactsField(id: $id, input: $input) {
      contactsField {
        ...contactsFields
      }
      errors {
        message
        key
      }
    }
  }
`;

export const DELETE_CONTACT_FIELDS = gql`
${CONTACT_FIELDS}
  mutation deleteContactsField($id: ID!) {
    deleteContactsField(id: $id) {
      ...contactsFields
      
      }
      errors {
        message
        key
      }
    }
  }
`;
