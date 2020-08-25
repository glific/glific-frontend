import { gql } from '@apollo/client';

export const TAG_MESSAGE_SUBSCRIPTION = gql`
subscription {
  createdMessageTag {
    message {
      id
      flow
      receiver {
        id
      }
      sender {
        id
      }
    }
    tag {
      id
      label
    }
  }
}
`;