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

// A separate document for the same field, deliberately.
//
// UPLOAD_MEDIA is shared by the chat composer, HSM templates and interactive messages. Adding
// the newer arguments to it would make all of those fail GraphQL validation against a server
// that does not have them yet — so a frontend deploy ahead of the backend would break every
// media upload in Glific. Keeping them here confines that risk to this field.
export const UPLOAD_CREDENTIAL_FILE = gql`
  mutation uploadMedia(
    $media: Upload!
    $extension: String!
    $maxSizeKb: Int
    $folder: String
    $storage: UploadStorageEnum
  ) {
    uploadMedia(media: $media, extension: $extension, maxSizeKb: $maxSizeKb, folder: $folder, storage: $storage)
  }
`;
