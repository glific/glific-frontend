import { gql } from '@apollo/client';

export const TAG_MESSAGE_SUBSCRIPTION = gql`
subscription {
  createdMessageTag {
    message {
      id
      receiver {
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