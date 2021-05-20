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

export default GET_EXTENSION;
