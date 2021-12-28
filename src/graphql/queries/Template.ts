import { gql } from '@apollo/client';

export const GET_TEMPLATES_COUNT = gql`
  query countSessionTemplates($filter: SessionTemplateFilter!) {
    countSessionTemplates(filter: $filter)
  }
`;

export const FILTER_TEMPLATES = gql`
  query sessionTemplates($filter: SessionTemplateFilter!, $opts: Opts!) {
    sessionTemplates(filter: $filter, opts: $opts) {
      id
      body
      label
      shortcode
      status
      isHsm
      isReserved
      isActive
      updatedAt
      translations
      numberParameters
      type
      language {
        id
        label
      }
      MessageMedia {
        id
        caption
        sourceUrl
      }
    }
  }
`;

export const GET_TEMPLATE = gql`
  query getsessionTemplate($id: ID!) {
    sessionTemplate(id: $id) {
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
      }
    }
  }
`;

export const GET_HSM_CATEGORIES = gql`
  query {
    whatsappHsmCategories
  }
`;
