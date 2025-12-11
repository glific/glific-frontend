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

export const SYNC_WHATSAPP_FORM = gql`
  mutation syncWhatsappForm {
    syncWhatsappForm {
      message
      errors {
        message
      }
    }
  }
`;
