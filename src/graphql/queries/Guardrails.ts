import { gql } from '@apollo/client';

export const GET_GUARDRAIL_VALIDATORS = gql`
  query guardrailValidators {
    guardrailValidators {
      validators {
        config
        link
        type
      }
    }
  }
`;
