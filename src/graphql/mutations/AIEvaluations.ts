import { gql } from '@apollo/client';

export const CREATE_EVALUATION = gql`
  mutation createEvaluation($input: EvaluationInput!) {
    createEvaluation(input: $input) {
      evaluation {
        status
      }
      errors {
        message
      }
    }
  }
`;

export const REQUEST_AI_EVALUATION_ACCESS = gql`
  mutation requestAiEvaluationAccess {
    requestAiEvaluationAccess {
      status
      errors {
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
