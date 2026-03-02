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

export const UPLOAD_FILE_TO_KAAPI = gql`
  mutation UploadFilesearchFile($media: Upload!) {
    uploadFilesearchFile(media: $media) {
      fileId
      filename
      uploadedAt
    }
  }
`;

export const CREATE_KNOWLEDGE_BASE = gql`
  mutation CreateKnowledgeBase($mediaInfo: [FileInfoInput!]!, $createKnowledgeBaseId: ID) {
    createKnowledgeBase(mediaInfo: $mediaInfo, id: $createKnowledgeBaseId) {
      knowledgeBase {
        id
        name
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
