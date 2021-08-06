import { gql } from '@apollo/client';

export const GET_ALL_FLOW_LABELS = gql`
  query flowLabels($filter: FlowLabelFilter, $opts: Opts) {
    flowLabels(filter: $filter, opts: $opts) {
      id
      name
    }
  }
`;

export const GET_FLOW_LABEL_BY_ID = gql`
  query flow($id: ID!) {
    flow(id: $id) {
      flow {
        id
        name
      }
    }
  }
`;
