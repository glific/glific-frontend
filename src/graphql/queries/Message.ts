import { gql } from '@apollo/client';

export const GET_MESSAGES_COUNT = gql`
  query countSessionTemplates($filter: SessionTemplateFilter!) {
    countSessionTemplates(filter: $filter)
  }
`;

export const FILTER_MESSAGES = gql`
  query sessionTemplates($filter: SessionTemplateFilter!, $order: SortOrder!) {
    sessionTemplates(filter: $filter, order: $order) {
      id
      body
      label
    }
  }
`;

export const GET_MESSAGE = gql`
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
