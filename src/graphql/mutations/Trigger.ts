import { gql } from '@apollo/client';

export const DELETE_SEARCH = gql`
  mutation deleteTrigger($id: ID!) {
    deleteTrigger(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;
