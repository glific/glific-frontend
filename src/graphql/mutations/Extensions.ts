import { gql } from '@apollo/client';

export const CREATE_EXTENSION = gql`
  mutation createExtension($input: ExtensionInput!) {
    createExtension(input: $input) {
      Extension {
        code
        isActive
        isValid
        module
        name
        id
      }
      errors {
        message
        key
      }
    }
  }
`;

export const DELETE_EXTENSION = gql`
  mutation deleteExtension($id: ID!) {
    deleteExtension(id: $id) {
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
  mutation update_organization_extension($clientId: ID!, $input: ExtensionInput!) {
    update_organization_extension(clientId: $clientId, input: $input) {
      Extension {
        code
        id
        isActive
        isValid
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
