import { gql } from '@apollo/client';

export const AI_EVALUATION_UPDATED = gql`
  subscription AiEvaluationUpdated {
    aiEvaluationUpdated {
      id
      name
      status
      failureReason
      results
      duplicationFactor
      goldenQa {
        id
        name
        duplicationFactor
      }
      assistantConfigVersion {
        id
        majorVersion
        minorVersion
        assistant {
          id
          name
        }
      }
      insertedAt
      updatedAt
    }
  }
`;

export const IMPROVE_PROMPT_UPDATED = gql`
  subscription ImprovePromptUpdated {
    improvePromptUpdated {
      status
      error
      configVersion {
        id
        majorVersion
        minorVersion
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
  }
`;
