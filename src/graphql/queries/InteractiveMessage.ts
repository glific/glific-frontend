import { gql } from '@apollo/client';

export const GET_INTERACTIVE_MESSAGES_COUNT = gql`
  query countInteractiveTemplates($filter: InteractiveTemplateFilter!) {
    countInteractiveTemplates(filter: $filter)
  }
`;

export const FILTER_INTERACTIVE_MESSAGES = gql`
  query interactiveTemplates($filter: InteractiveTemplateFilter!, $opts: Opts!) {
    interactiveTemplates(filter: $filter, opts: $opts) {
      id
      label
      interactiveContent
      type
    }
  }
`;

export const GET_INTERACTIVE_MESSAGE = gql`
  query getInteractiveTemplate($id: ID!) {
    interactiveTemplate(id: $id) {
      interactiveTemplate {
        id
        label
        interactiveContent
        type
      }
    }
  }
`;
