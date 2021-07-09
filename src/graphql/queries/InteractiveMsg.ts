import { gql } from '@apollo/client';

export const FILTER_INTERACTIVE_MSG = gql`
  query interactives($filter: InteractiveFilter, $opts: Opts) {
    interactives(filter: $filter, opts: $opts) {
      id
      insertedAt
      interactiveContent
      label
      type
      updatedAt
    }
  }
`;

export default FILTER_INTERACTIVE_MSG;
