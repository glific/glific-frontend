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
        versionNumber
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
