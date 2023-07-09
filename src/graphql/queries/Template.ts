import { gql } from '@apollo/client';

const templateFields = `
    id
    body
    label
    isHsm
    updatedAt
    translations
    type
    language {
      id
      label
    }
`;

export const GET_TEMPLATES_COUNT = gql`
  query countSessionTemplates($filter: SessionTemplateFilter!) {
    countSessionTemplates(filter: $filter)
  }
`;

export const FILTER_TEMPLATES = gql`
  query sessionTemplates($filter: SessionTemplateFilter!, $opts: Opts!) {
    sessionTemplates(filter: $filter, opts: $opts) {
      ${templateFields}
      bsp
      shortcode
      status
      reason
      isReserved
      isActive
      numberParameters
      MessageMedia {
        id
        caption
        sourceUrl
      }
    }
  }
`;

export const FILTER_SESSION_TEMPLATES = gql`
  query sessionTemplates($filter: SessionTemplateFilter!, $opts: Opts!) {
    sessionTemplates(filter: $filter, opts: $opts) {
     ${templateFields}
    }
  }
`;

export const GET_TEMPLATE = gql`
  query getsessionTemplate($id: ID!) {
    sessionTemplate(id: $id) {
      sessionTemplate {
        ${templateFields}
        isActive
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
      }
    }
  }
`;

export const GET_HSM_CATEGORIES = gql`
  query {
    whatsappHsmCategories
  }
`;
