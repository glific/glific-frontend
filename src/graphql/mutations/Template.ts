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
        label
        body
        isActive
        language {
          label
          id
        }
        translations
        type
        MessageMedia {
          id
          caption
          sourceUrl
        }
        category
        shortcode
        example
        hasButtons
        buttons
        buttonType
        allowTemplateCategoryChange
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
        isActive
        language {
          label
          id
        }
        translations
        type
        MessageMedia {
          id
          caption
          sourceUrl
        }
        category
        shortcode
        example
        hasButtons
        buttons
        buttonType
        allowTemplateCategoryChange
      }
    }
  }
`;

export const IMPORT_TEMPLATES = gql`
  mutation ImportTemplates($data: String) {
    importTemplates(data: $data) {
      errors {
        key
        message
      }
      status
    }
  }
`;

export const SYNC_HSM_TEMPLATES = gql`
  mutation syncHsmTemplate {
    syncHsmTemplate {
      message
      errors {
        key
        message
      }
    }
  }
`;

export const BULK_APPLY_TEMPLATES = gql`
  mutation BulkApplyTemplates($data: String) {
    bulkApplyTemplates(data: $data) {
      errors {
        message
        key
      }
      csv_rows
    }
  }
`;

export const REPORT_TO_GUPSHUP = gql`
  mutation ReportToGupshup($cc: Json, $templateId: ID!) {
    reportToGupshup(cc: $cc, templateId: $templateId) {
      errors {
        message
        key
      }
      message
    }
  }
`;
