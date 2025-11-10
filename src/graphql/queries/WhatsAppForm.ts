import { gql } from '@apollo/client';

export const GET_WHATSAPP_FORM = gql`
  query get_whatsapp_form_by_id($id: ID!) {
    getWhatsappFormById(id: $id) {
      id
      name
      status
      description
      metaFlowId
      categories
      definition
      errors {
        message
      }
    }
  }
`;

export const LIST_FORM_CATEGORIES = gql`
  query {
    whatsappFormCategories
  }
`;

export const LIST_WHATSAPP_FORMS = gql`
  query listWhatsappForms($filter: WhatsappFormFilter) {
    listWhatsappForms(filter: $filter) {
      id
      name
      status
      description
      metaFlowId
      categories
      definition
    }
  }
`;
