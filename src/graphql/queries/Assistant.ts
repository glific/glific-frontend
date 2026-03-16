import { gql } from '@apollo/client';

export const GET_ASSISTANT_CONFIG_VERSIONS = gql`
  query AssistantConfigVersions {
    assistantConfigVersions {
      id
      assistantId
      versionNumber
      description
      model
      status
      assistantName
      kaapiUuid
    }
  }
`;

export const GET_ASSISTANTS = gql`
  query Assistants($filter: AssistantFilter, $opts: Opts) {
    assistants(filter: $filter, opts: $opts) {
      itemId: assistantDisplayId
      id
      insertedAt
      name
      status
      newVersionInProgress
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
          vectorStoreId
          knowledgeBaseVersionId
          name
          legacy
          size
          files {
            name
            id
            fileSize
          }
        }
      }
    }
  }
`;
