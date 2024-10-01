import { gql } from '@apollo/client';

export const VECTOR_STORES = gql`
  query VectorStores($filter: VectorStoreFilter, $opts: Opts) {
    vectorStores(filter: $filter, opts: $opts) {
      id
      insertedAt
      name
      size
      updatedAt
      itemId: vectorStoreId
    }
  }
`;

export const VECTOR_STORE = gql`
  query VectorStore($vectorStoreId: ID!) {
    vectorStore(id: $vectorStoreId) {
      vectorStore {
        assistants {
          id
          instructions
          model
          name
        }
        files {
          id
          name
          size
        }
        id
        insertedAt
        name
        size
        updatedAt
        vectorStoreId
      }
      errors {
        message
      }
    }
  }
`;
