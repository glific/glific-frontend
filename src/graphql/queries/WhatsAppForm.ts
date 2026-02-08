import { gql } from '@apollo/client';

export const GET_LATEST_WHATSAPP_FORM_REVISION = gql`
  query WhatsappForm($id: ID!) {
    whatsappForm(id: $id) {
      whatsappForm {
        name
        status
        revision {
          id
          definition
        }
      }
    }
  }
`;

export const GET_WHATSAPP_FORM = gql`
  query WhatsappForm($id: ID!) {
    whatsappForm(id: $id) {
      whatsappForm {
        description
        revision {
          definition
        }
        categories
        id
        metaFlowId
        name
        status
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
    whatsappForms: listWhatsappForms(filter: $filter) {
      id
      name
      status
      description
      metaFlowId
      revision {
        id
        definition
      }
      categories
      sheet {
        id
        url
      }
    }
  }
`;

export const GET_WHATSAPP_FORM_DEFINITIONS = gql`
  query listWhatsappForms($filter: WhatsappFormFilter) {
    listWhatsappForms(filter: $filter) {
      name
      metaFlowId
      revision {
        definition
      }
    }
  }
`;

export const GET_WHATSAPP_FORM_REVISION = gql`
  query WhatsappFormRevision($id: ID!) {
    whatsappFormRevision(id: $id) {
      whatsappFormRevision {
        id
        whatsappFormId
        definition
        revisionNumber
        userId
      }
      errors {
        key
        message
      }
    }
  }
`;

export const LIST_WHATSAPP_FORM_REVISIONS = gql`
  query ListWhatsappFormRevisions($whatsappFormId: ID!, $limit: Int) {
    listWhatsappFormRevisions(whatsappFormId: $whatsappFormId, limit: $limit) {
      id
      definition
      revisionNumber
      isCurrent
    }
  }
`;

export const COUNT_WHATSAPP_FORMS = gql`
  query countWhatsappForms($filter: WhatsappFormFilter) {
    countWhatsappForms(filter: $filter)
  }
`;
