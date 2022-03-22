import { gql } from '@apollo/client';

export const CREATE_INTERACTIVE = gql`
  mutation createInteractiveTemplate($input: InteractiveTemplateInput!) {
    createInteractiveTemplate(input: $input) {
      interactiveTemplate {
        id
        label
        interactiveContent
        type
        translations
        language {
          id
          label
        }
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_INTERACTIVE = gql`
  mutation updateInteractiveTemplate($id: ID!, $input: InteractiveTemplateInput!) {
    updateInteractiveTemplate(id: $id, input: $input) {
      interactiveTemplate {
        id
        label
        interactiveContent
        type
        translations
        language {
          id
          label
        }
      }
      errors {
        key
        message
      }
    }
  }
`;

export const DELETE_INTERACTIVE = gql`
  mutation deleteInteractiveTemplate($id: ID!) {
    deleteInteractiveTemplate(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const COPY_INTERACTIVE = gql`
  mutation CopyInteractiveTemplate($id: ID!, $input: InteractiveTemplateInput) {
    copyInteractiveTemplate(id: $id, input: $input) {
      errors {
        message
      }
      interactiveTemplate {
        interactiveContent
        label
        language {
          id
          label
        }
        sendWithTitle
        translations
        type
      }
    }
  }
`;
