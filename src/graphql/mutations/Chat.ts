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

export const UPDATE_MESSAGE_TAGS = gql`
  mutation updateMessageTags($input: MessageTagsInput!) {
    updateMessageTags(input: $input) {
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

export const MESSAGE_FRAGMENT = gql`
  fragment myTodo on Message {
    tags {
      id
      label
    }
  }
`;
