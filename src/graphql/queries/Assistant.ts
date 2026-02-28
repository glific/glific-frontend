import { gql } from '@apollo/client';

export const GET_ASSISTANTS = gql`
  query Assistants($filter: AssistantFilter, $opts: Opts) {
    assistants(filter: $filter, opts: $opts) {
      itemId: assistantDisplayId
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
        assistantId: assistantDisplayId
        id
        newVersionInProgress
        name
        model
        instructions
        status
        temperature
        vectorStore {
          id
          knowledgeBaseVersionId
          name
          legacy
          files {
            name
            id
          }
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
