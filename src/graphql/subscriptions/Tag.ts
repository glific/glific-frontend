import { gql } from '@apollo/client';

export const ADD_MESSAGE_TAG_SUBSCRIPTION = gql`
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

export const DELETE_MESSAGE_TAG_SUBSCRIPTION = gql`
subscription {
  deletedMessageTag {
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