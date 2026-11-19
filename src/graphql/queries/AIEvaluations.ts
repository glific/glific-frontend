import { gql } from '@apollo/client';

export const LIST_AI_EVALUATIONS = gql`
  query AiEvaluations($filter: AiEvaluationFilter, $opts: Opts) {
    aiEvaluations(filter: $filter, opts: $opts) {
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

export const GOLDEN_QA_LIST_VARIABLES = {
  filter: {},
  opts: { order: 'DESC', orderWith: 'inserted_at' },
};

export const LIST_GOLDEN_QA = gql`
  query GoldenQas($filter: GoldenQaFilter, $opts: Opts) {
    goldenQas(filter: $filter, opts: $opts) {
      id
      name
      totalItems
      insertedAt
    }
  }
`;

export const GET_EVALUATION_SCORES = gql`
  query EvaluationScores($id: ID!, $exportFormat: String) {
    evaluationScores(id: $id, exportFormat: $exportFormat) {
      scores
      errors {
        message
      }
    }
  }
`;

export const GET_GOLDEN_QA = gql`
  query GetGoldenQa($id: ID!, $includeSignedUrl: Boolean) {
    goldenQa(id: $id, includeSignedUrl: $includeSignedUrl) {
      goldenQa {
        id
        name
        signedUrl
        totalItems
        insertedAt
      }
      errors {
        message
      }
    }
  }
`;
