import { gql } from '@apollo/client';

export const CREATE_EVALUATION = gql`
  mutation createEvaluation($input: EvaluationInput!) {
    createEvaluation(input: $input) {
      evaluation {
        status
      }
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_GOLDEN_QA = gql`
  mutation CreateGoldenQa($input: GoldenQaInput!) {
    createGoldenQa(input: $input) {
      goldenQa {
        id
        datasetId
        name
      }
      errors {
        message
      }
    }
  }
`;

export const IMPROVE_EVALUATION_PROMPT = gql`
  mutation ImproveEvaluationPrompt($evaluationId: ID!) {
    improveEvaluationPrompt(evaluationId: $evaluationId) {
      errors {
        message
      }
      improvePrompt {
        status
      }
    }
  }
`;
