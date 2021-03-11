import { gql } from '@apollo/client';

export const DELETE_TRIGGER = gql`
  mutation deleteTrigger($id: ID!) {
    deleteTrigger(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;
export default DELETE_TRIGGER;
