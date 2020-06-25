import { gql } from '@apollo/client';

export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
subscription {
  receivedMessage {
    id
    body
    flow
    type
    receiver {
      id
      phone
    }
    sender {
      id
      phone
    }
  }
}
`;