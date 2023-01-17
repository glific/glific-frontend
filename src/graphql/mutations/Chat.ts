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
        media {
          url
          caption
        }
      }
    }
  }
`;

export const CONTACT_FRAGMENT = gql`
  fragment isOrgRead on Contact {
    isOrgRead
  }
`;

export const MARK_AS_READ = gql`
  mutation markContactMessagesAsRead($contactId: Gid!) {
    markContactMessagesAsRead(contactId: $contactId)
  }
`;

export const CREATE_AND_SEND_MESSAGE_TO_COLLECTION_MUTATION = gql`
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

export const CREATE_MEDIA_MESSAGE = gql`
  mutation createMediaMessage($input: MessageMediaInput!) {
    createMessageMedia(input: $input) {
      messageMedia {
        id
      }
    }
  }
`;

export const UPLOAD_MEDIA_BLOB = gql`
  mutation uploadBlob($media: String!, $extension: String!) {
    uploadBlob(media: $media, extension: $extension)
  }
`;

export const UPLOAD_MEDIA = gql`
  mutation uploadMedia($media: Upload!, $extension: String!) {
    uploadMedia(media: $media, extension: $extension)
  }
`;
