import { gql } from '@apollo/client';

export const GET_EXTENSION = gql`
  query Extension($id: ID!, $clientId: ID!) {
    Extension(id: $id, clientId: $clientId) {
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

export default GET_EXTENSION;
