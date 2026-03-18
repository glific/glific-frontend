import { gql } from '@apollo/client';

export const LIST_AI_EVALUATIONS = gql`
  query AiEvaluations {
    aiEvaluations {
      id
      name
      status
      failureReason
      results
      kaapiEvaluationId
      datasetId
      configId
      configVersion
      insertedAt
      updatedAt
    }
  }
`;
