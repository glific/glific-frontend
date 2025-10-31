import { gql } from '@apollo/client';

export const GET_WHATSAPP_FORM = gql`
  query WhatsappForm($id: ID!) {
    whatsappForm(id: $id) {
      whatsappForm {
        definition
        description
        categories
        id
        insertedAt
        metaFlowId
        name
        status
        updatedAt
      }
    }
  }
`;

export const LIST_FORM_CATEGORIES = gql`
  query {
    whatsappFormCategories
  }
`;
