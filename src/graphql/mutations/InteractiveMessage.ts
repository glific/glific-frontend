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

export const TRANSLATE_INTERACTIVE = gql`
  mutation TranslateInteractiveTemplate($translateInteractiveTemplateId: ID!) {
    translateInteractiveTemplate(id: $translateInteractiveTemplateId) {
      errors {
        key
        message
      }
      interactiveTemplate {
        id
        insertedAt
        interactiveContent
        label
        language {
          id
          label
        }
        sendWithTitle
        tag {
          id
          label
        }
        translations
        type
        updatedAt
      }
    }
  }
`;

export const EXPORT_INTERACTIVE = gql`
  mutation ExportInteractiveTemplate($exportInteractiveTemplateId: ID!) {
    exportInteractiveTemplate(id: $exportInteractiveTemplateId) {
      exportData
    }
  }
`;
