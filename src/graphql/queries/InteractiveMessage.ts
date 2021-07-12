import { gql } from '@apollo/client';

export const GET_INTERACTIVE_MESSAGES_COUNT = gql`
  query countInteractives($filter: InteractiveFilter!) {
    countInteractives(filter: $filter)
  }
`;

export const FILTER_INTERACTIVE_MESSAGES = gql`
  query interactives($filter: InteractiveFilter!, $opts: Opts!) {
    interactives(filter: $filter, opts: $opts) {
      id
      label
      interactiveContent
      type
    }
  }
`;

export const GET_INTERACTIVE_MESSAGE = gql`
  query getInteractive($id: ID!) {
    interactive(id: $id) {
      interactive {
        id
        label
        interactiveContent
        type
      }
    }
  }
`;
