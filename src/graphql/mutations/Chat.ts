import { gql } from '@apollo/client';

export const CREATE_MESSAGE_MUTATION = gql`

mutation createAndSendMessage($input: MessageInput!) {
  createAndSendMessage(input: $input) {
    message {
        id
        body
        insertedAt
        sender {
          id
        }
        receiver {
          id
        }
        tags {
          id
          label
        }
      }
    }
  }
`;

export const CREATE_MESSAGE_TAG = gql`
  mutation createMessageTag($input: MessageTagInput!) {
    createMessageTag(input: $input) {
      messageTag {
        message {
          id
        }
        tag {
          id
          label
        }
      }
    }
  }
`;
