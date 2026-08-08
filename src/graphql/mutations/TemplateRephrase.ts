import { gql } from '@apollo/client';

export const REPHRASE_TEMPLATE_BODY = gql`
  mutation RephraseTemplateBody($input: TemplateRephraseInput!) {
    rephraseTemplateBody(input: $input) {
      templateRephrase {
        id
        status
        rephrasedText
        errorMessage
      }
      errors {
        key
        message
      }
    }
  }
`;
