import { gql } from '@apollo/client';

export const GET_EXTENSION = gql`
  query Extension($id: ID!) {
    Extension(id: $id) {
      Extension {
        code
        id
        insertedAt
        updatedAt
        isActive
        isValid
        name
        organization {
          name
          isActive
        }
      }
    }
  }
`;

export const GET_ORGANIZATION_EXTENSION = gql`
  query getOrganizationExtension($clientId: ID!) {
    getOrganizationExtension(clientId: $clientId) {
      Extension {
        code
        id
        insertedAt
        updatedAt
        isActive
        isValid
        name
        organization {
          name
          isActive
        }
      }
    }
  }
`;
