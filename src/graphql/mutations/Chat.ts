import { gql } from '@apollo/client';

export const CREATE_AND_SEND_MESSAGE_MUTATION = gql`
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

export const CREATE_MESSAGE_TAGS = gql`
  mutation createMessageTag($input: MessageTagsInput!) {
    createMessageTags(input: $input) {
      messageTags {
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
