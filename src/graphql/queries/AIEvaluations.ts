import { gql } from '@apollo/client';

export const COUNT_AI_EVALUATIONS = gql`
  query countAiEvaluations($filter: AiEvaluationFilter) {
    countAiEvaluations(filter: $filter)
  }
`;

export const LIST_AI_EVALUATIONS = gql`
  query AiEvaluations($filter: AiEvaluationFilter, $opts: Opts) {
    aiEvaluations(filter: $filter, opts: $opts) {
      id
      name
      status
      failureReason
      results
      kaapiEvaluationId
      datasetId
      assistantConfigVersionId
      insertedAt
      updatedAt
    }
  }
`;
