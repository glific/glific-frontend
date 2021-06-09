import { gql } from '@apollo/client';

export const GET_FLOWS = gql`
  query flows($filter: FlowFilter, $opts: Opts) {
    flows(filter: $filter, opts: $opts) {
      id
      name
      uuid
    }
  }
`;

export const GET_FLOW = gql`
  query getFlow($id: ID!) {
    flow(id: $id) {
      flow {
        id
        name
        uuid
        isActive
        keywords
        ignoreKeywords
      }
    }
  }
`;

export const GET_FLOW_COUNT = gql`
  query countFlows($filter: FlowFilter!) {
    countFlows(filter: $filter)
  }
`;

export const FILTER_FLOW = gql`
  query getFlows($filter: FlowFilter!, $opts: Opts!) {
    flows(filter: $filter, opts: $opts) {
      id
      name
      uuid
      keywords
      lastChangedAt
      lastPublishedAt
      ignoreKeywords
      updatedAt
    }
  }
`;

export const GET_FLOW_DETAILS = gql`
  query getFlowName($filter: FlowFilter!, $opts: Opts!) {
    flows(filter: $filter, opts: $opts) {
      id
      isActive
      name
      keywords
    }
  }
`;

export const EXPORT_FLOW = gql`
  query exportFlow($id: ID!) {
    exportFlowDefinition(id: $id) {
      definition
    }
  }
`;
