import { gql } from '@apollo/client';

export const CREATE_GOLDEN_QA = gql`
  mutation CreateGoldenQa($input: GoldenQaInput!) {
    createGoldenQa(input: $input) {
      goldenQa {
        name
      }
      errors {
        message
      }
    }
  }
`;
