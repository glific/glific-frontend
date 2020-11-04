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
  fragment tags on Message {
    tags {
      id
      label
    }
  }
`;

export const MARK_AS_READ = gql`
  mutation markContactMessagesAsRead($contactId: Gid!) {
    markContactMessagesAsRead(contactId: $contactId)
  }
`;

export const CREATE_AND_SEND_MESSAGE_TO_GROUP_MUTATION = gql`
  mutation createAndSendMessageToGroup($groupId: ID!, $input: MessageInput!) {
    createAndSendMessageToGroup(groupId: $groupId, input: $input) {
      success
    }
  }
`;

export const CLEAR_MESSAGES = gql`
  mutation clearMessages($contactId: ID!) {
    clearMessages(contactId: $contactId) {
      success
      errors {
        key
        message
      }
    }
  }
`;
