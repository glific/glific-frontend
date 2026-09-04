import { gql } from '@apollo/client';

export const ASSISTANT_CHAT_RESPONSE = gql`
  subscription AssistantChatResponse {
    assistantChatResponse {
      answer
      conversationId
      jobId
      requestId
      errors {
        key
        message
      }
    }
  }
`;

export const ASSISTANT_CONFIG_VERSION_UPDATED = gql`
  subscription AssistantConfigVersionUpdated {
    assistantConfigVersionUpdated {
      id
      majorVersion
      minorVersion
      versionLabel
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

export const KNOWLEDGE_BASE_VERSION_UPDATED = gql`
  subscription KnowledgeBaseVersionUpdated {
    knowledgeBaseVersionUpdated {
      id
      knowledgeBaseId
      versionNumber
      status
      size
      insertedAt
      updatedAt
    }
  }
`;
