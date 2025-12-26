import { gql } from '@apollo/client';

export const CREATE_FORM = gql`
  mutation CreateWhatsappForm($input: WhatsappFormInput!) {
    createWhatsappForm(input: $input) {
      whatsappForm {
        id
        name
      }
      errors {
        message
      }
    }
  }
`;

export const UPDATE_FORM = gql`
  mutation UpdateWhatsappForm($id: ID!, $input: WhatsappFormInput!) {
    updateWhatsappForm(id: $id, input: $input) {
      whatsappForm {
        id
        name
      }
      errors {
        message
      }
    }
  }
`;

export const DELETE_FORM = gql`
  mutation DeleteWhatsappForm($id: ID!) {
    deleteWhatsappForm(id: $id) {
      whatsappForm {
        id
      }
      errors {
        message
      }
    }
  }
`;

export const PUBLISH_FORM = gql`
  mutation publishWhatsappForm($id: ID!) {
    publishWhatsappForm(id: $id) {
      whatsappForm {
        id
        status
      }
      errors {
        message
      }
    }
  }
`;

export const DEACTIVATE_FORM = gql`
  mutation DeactivateWhatsappForm($id: ID!) {
    deactivateWhatsappForm(id: $id) {
      whatsappForm {
        id
        status
      }
      errors {
        message
      }
    }
  }
`;

export const ACTIVATE_FORM = gql`
  mutation ActivateWhatsappForm($activateWhatsappFormId: ID!) {
    activateWhatsappForm(id: $activateWhatsappFormId) {
      whatsappForm {
        categories
        definition
        description
        id
        insertedAt
        metaFlowId
        name
        status
        updatedAt
      }
      errors {
        message
      }
    }
  }
`;

export const SAVE_WHATSAPP_FORM_REVISION = gql`
  mutation SaveWhatsappFormRevision($input: WhatsappFormRevisionInput!) {
    saveWhatsappFormRevision(input: $input) {
      whatsappFormRevision {
        id
        revisionNumber
      }
    }
  }
`;

export const REVERT_TO_WHATSAPP_FORM_REVISION = gql`
  mutation RevertToWhatsappFormRevision($whatsappFormId: ID!, $revisionId: ID!) {
    revertToWhatsappFormRevision(whatsappFormId: $whatsappFormId, revisionId: $revisionId) {
      whatsappFormRevision {
        definition
      }
      errors {
        key
        message
      }
    }
  }
`;
