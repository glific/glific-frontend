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
