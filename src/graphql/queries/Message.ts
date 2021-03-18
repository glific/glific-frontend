import { gql } from '@apollo/client';

export const GET_MESSAGE_NUMBER = gql`
  query message($id: ID!) {
    message(id: $id) {
      message {
        messageNumber
      }
    }
  }
`;

export default GET_MESSAGE_NUMBER;
