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

export const PUBLISH_FORM = gql`
  mutation publishWhatsappForm($id: ID!) {
    publishWhatsappForm(id: $id) {
      status
      body {
        id
        name
        description
        metaFlowId
        status
        categories
      }
    }
  }
`;
