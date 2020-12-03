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
      isHsm
      isReserved
      updatedAt
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
          id
        }
      }
    }
  }
`;
