import { gql } from '@apollo/client';

export const DELETE_TEMPLATE = gql`
  mutation deleteSessionTemplate($id: ID!) {
    deleteSessionTemplate(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_TEMPLATE = gql`
  mutation createSessionTemplate($input: SessionTemplateInput!) {
    createSessionTemplate(input: $input) {
      sessionTemplate {
        id
        body
        label
        translations
        type
        hasButtons
        buttons
        buttonType
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_TEMPLATE = gql`
  mutation updateSessionTemplate($id: ID!, $input: SessionTemplateInput!) {
    updateSessionTemplate(id: $id, input: $input) {
      sessionTemplate {
        id
        label
        body
        language {
          id
          label
        }
      }
    }
  }
`;
