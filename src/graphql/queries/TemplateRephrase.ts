import { gql } from '@apollo/client';

export const TEMPLATE_REPHRASE = gql`
  query TemplateRephrase($id: ID!) {
    templateRephrase(id: $id) {
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
