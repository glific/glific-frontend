import { gql } from '@apollo/client';

export const CREATE_ASSISTANT = gql`
  mutation CreateAssistant($input: AssistantInput) {
    createAssistant(input: $input) {
      assistant {
        id
        name
      }
    }
  }
`;

export const UPDATE_ASSISTANT = gql`
  mutation UpdateAssistant($updateAssistantId: ID!, $input: AssistantInput) {
    updateAssistant(id: $updateAssistantId, input: $input) {
      errors {
        message
        key
      }
    }
  }
`;

export const UPLOAD_FILE_TO_OPENAI = gql`
  mutation UploadFilesearchFile($media: Upload!) {
    uploadFilesearchFile(media: $media) {
      fileId
      filename
    }
  }
`;

export const ADD_FILES_TO_FILE_SEARCH = gql`
  mutation AddAssistantFiles($addAssistantFilesId: ID!, $mediaInfo: [FileInfoInput!]!) {
    addAssistantFiles(id: $addAssistantFilesId, mediaInfo: $mediaInfo) {
      assistant {
        id
      }
      errors {
        key
        message
      }
    }
  }
`;

export const REMOVE_FILES_FROM_ASSISTANT = gql`
  mutation RemoveAssistantFile($fileId: String!, $removeAssistantFileId: ID!) {
    removeAssistantFile(fileId: $fileId, id: $removeAssistantFileId) {
      assistant {
        id
      }
      errors {
        message
        key
      }
    }
  }
`;

export const DELETE_ASSISTANT = gql`
  mutation DeleteAssistant($deleteAssistantId: ID!) {
    deleteAssistant(id: $deleteAssistantId) {
      assistant {
        name
        assistantId
      }
      errors {
        message
      }
    }
  }
`;
