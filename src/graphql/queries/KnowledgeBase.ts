import { gql } from '@apollo/client';

export const GET_DOCUMENTS = gql`
  query getGroup($id: ID!) {
    group(id: $id) {
      group {
        id
        label
        roles {
          id
          label
        }
        description
        users {
          id
          name
        }
      }
    }
  }
`;
