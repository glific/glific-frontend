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
      message
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

export const TRANSLATE_INTERACTIVE_TEMPLATE = gql`
  mutation TranslateInteractiveTemplate($translateInteractiveTemplateId: ID!) {
    translateInteractiveTemplate(id: $translateInteractiveTemplateId) {
      message
      errors {
        key
        message
      }
      interactiveTemplate {
        id
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
      }
    }
  }
`;

export const EXPORT_INTERACTIVE_TEMPLATE = gql`
  mutation ExportInteractiveTemplate($exportInteractiveTemplateId: ID!, $addTranslation: Boolean) {
    exportInteractiveTemplate(id: $exportInteractiveTemplateId, addTranslation: $addTranslation) {
      exportData
    }
  }
`;

export const IMPORT_INTERACTIVE_TEMPLATE = gql`
  mutation ImportInteractiveTemplate($importInteractiveTemplateId: ID!, $translation: String) {
    importInteractiveTemplate(id: $importInteractiveTemplateId, translation: $translation) {
      message
      errors {
        key
        message
      }
      interactiveTemplate {
        id
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
      }
    }
  }
`;
