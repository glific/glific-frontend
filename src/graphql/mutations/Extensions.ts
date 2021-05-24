import { gql } from '@apollo/client';

export const CREATE_EXTENSION = gql`
  mutation createExtension($input: ExtensionInput!) {
    createExtension(input: $input) {
      extension {
        code
        isActive
        isValid
        module
        name
      }
      errors {
        message
        key
      }
    }
  }
`;

export const DELETE_EXTENSION = gql`
  mutation deleteExtension($id: ID, $clientId: ID) {
    deleteExtension(id: $id, clientId: $clientId) {
      Extension {
        code
        id
        insertedAt
        updatedAt
        isActive
        isValid
        module
        name
        organization {
          name
          isActive
        }
      }
    }
  }
`;

export const UPDATE_EXTENSION = gql`
  mutation updateExtension($id: ID!, $input: ExtensionInput!) {
    updateExtension(id: $id, input: $input) {
      Extension {
        code
        id
        insertedAt
        updatedAt
        isActive
        isValid
        module
        name
        organization {
          name
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
