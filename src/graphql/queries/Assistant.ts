import { gql } from '@apollo/client';

export const GET_ASSISTANTS = gql`
  query Assistants($filter: AssistantFilter, $opts: Opts) {
    assistants(filter: $filter, opts: $opts) {
      itemId: assistantId
      id
      insertedAt
      name
    }
  }
`;

export const GET_ASSISTANT = gql`
  query Assistant($assistantId: ID!) {
    assistant(id: $assistantId) {
      assistant {
        assistantId
        id
        insertedAt
        instructions
        model
        name
        temperature
        updatedAt
      }
    }
  }
`;

export const GET_ASSISTANT_FILES = gql`
  query Assistant($assistantId: ID!) {
    assistant(id: $assistantId) {
      assistant {
        vectorStore {
          files {
            fileId: id
            filename: name
          }
          id
          name
          vectorStoreId
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
