import { gql } from '@apollo/client';

export const GET_ASSISTANTS = gql`
  query Assistants($filter: AssistantFilter, $opts: Opts) {
    assistants(filter: $filter, opts: $opts) {
      itemId: assistant_id
      id
      insertedAt: inserted_at
      name
    }
  }
`;

export const GET_ASSISTANT = gql`
  query Assistant($assistantId: ID!) {
    assistant(id: $assistantId) {
      assistant {
        assistantId: assistant_id
        id
        insertedAt: inserted_at
        instructions
        model
        name
        temperature
        status
        newVersionInProgress: new_version_in_progress
        updatedAt: updated_at
      }
    }
  }
`;

export const GET_ASSISTANT_FILES = gql`
  query Assistant($assistantId: ID!) {
    assistant(id: $assistantId) {
      assistant {
        vectorStore: vector_store {
          files {
            fileId: id
            filename: name
          }
          id
          legacy
          name
          status
          vectorStoreId: vector_store_id
        }
      }
    }
  }
`;

export const GET_MODELS = gql`
  query RootQueryType {
    listOpenaiModels
  }
`;
