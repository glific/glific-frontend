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

export const CREATE_GOLDEN_QA = gql`
  mutation CreateGoldenQa($input: GoldenQaInput!) {
    createGoldenQa(input: $input) {
      goldenQa {
        datasetId
        name
      }
      errors {
        message
      }
    }
  }
`;
