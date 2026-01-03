import { gql } from '@apollo/client';

export const GET_WHATSAPP_FORM = gql`
  query WhatsappForm($id: ID!) {
    whatsappForm(id: $id) {
      whatsappForm {
        description
        categories
        id
        insertedAt
        metaFlowId
        name
        status
        updatedAt
        sheet {
          id
          url
        }
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
      sheet {
        id
        label
        url
        isActive
        sheetDataCount
      }
    }
  }
`;
