import { gql } from '@apollo/client';

export const CREATE_STORAGE = gql`
  mutation CreateVectorStore($input: VectorStoreInput) {
    createVectorStore(input: $input) {
      vectorStore {
        name
        id
        insertedAt
        size
        files {
          id
          name
          size
        }
        vectorStoreId
        assistants {
          id
          instructions
          model
          name
        }
      }
    }
  }
`;

export const UPDATE_VECTORE_STORE = gql`
  mutation UpdateVectorStore($updateVectorStoreId: ID!, $input: VectorStoreInput!) {
    updateVectorStore(id: $updateVectorStoreId, input: $input) {
      vectorStore {
        id
        name
      }
    }
  }
`;

export const UPLOAD_FILES_TO_STORAGE = gql`
  mutation AddVectorStoreFiles($addVectorStoreFilesId: ID!, $media: [Upload!]!) {
    addVectorStoreFiles(id: $addVectorStoreFilesId, media: $media) {
      vectorStore {
        id
        files {
          id
          name
          size
        }
      }
      errors {
        message
      }
    }
  }
`;

export const REMOVE_FILES_FROM_STORAGE = gql`
  mutation RemoveVectorStoreFile($fileId: String!, $removeVectorStoreFileId: ID!) {
    removeVectorStoreFile(fileId: $fileId, id: $removeVectorStoreFileId) {
      errors {
        message
      }
      vectorStore {
        id
      }
    }
  }
`;
