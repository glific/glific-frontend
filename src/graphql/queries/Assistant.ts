import { gql } from '@apollo/client';

/** @deprecated Use FILTER_ASSISTANTS instead */
export const GET_ASSISTANTS = gql`
  query Assistants($filter: AssistantFilter, $opts: Opts) {
    assistants(filter: $filter, opts: $opts) {
      itemId: assistantDisplayId
      id
      insertedAt
      name
      status
      newVersionInProgress
      cloneStatus
    }
  }
`;

export const FILTER_ASSISTANTS = gql`
  query Assistants($filter: AssistantFilter, $opts: Opts) {
    assistants(filter: $filter, opts: $opts) {
      assistantDisplayId
      id
      insertedAt
      updatedAt
      name
      status
      liveVersionNumber
      activeConfigVersionId
      cloneStatus
    }
  }
`;

export const GET_ASSISTANTS_COUNT = gql`
  query CountAssistants($filter: AssistantFilter) {
    countAssistants(filter: $filter)
  }
`;

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

export const GET_ASSISTANT = gql`
  query Assistant($assistantId: ID!) {
    assistant(id: $assistantId) {
      assistant {
        assistantId: assistantDisplayId
        id
        newVersionInProgress
        cloneStatus
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
export const GET_ASSISTANT_VERSIONS = gql`
  query AssistantVersions($assistantId: ID!) {
    assistantVersions(assistantId: $assistantId) {
      id
      versionNumber
      model
      prompt
      settings
      status
      isLive
      description
      insertedAt
      updatedAt
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
`;
