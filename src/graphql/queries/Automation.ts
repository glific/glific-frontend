import { gql } from '@apollo/client';

export const GET_AUTOMATIONS = gql`
  query flows($filter: FlowFilter, $opts: Opts) {
    flows(filter: $filter, opts: $opts) {
      id
      name
      uuid
    }
  }
`;

export const GET_AUTOMATION = gql`
  query getFlow($id: ID!) {
    flow(id: $id) {
      flow {
        id
        name
        uuid
        keywords
        ignoreKeywords
      }
    }
  }
`;

export const GET_AUTOMATION_COUNT = gql`
  query countFlows($filter: FlowFilter!) {
    countFlows(filter: $filter)
  }
`;

export const FILTER_AUTOMATION = gql`
  query tags($filter: FlowFilter!, $opts: Opts!) {
    flows(filter: $filter, opts: $opts) {
      id
      name
      uuid
      keywords
      ignoreKeywords
    }
  }
`;
