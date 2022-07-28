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
        isBackground
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
      isBackground
      lastPublishedAt
      ignoreKeywords
      updatedAt
      isPinned
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
    exportFlow(id: $id) {
      exportData
    }
  }
`;

export const TERMINATE_FLOW = gql`
  mutation TerminateContactFlows($contactId: ID!) {
    terminateContactFlows(contactId: $contactId) {
      success
      errors {
        message
      }
    }
  }
`;

export const GET_FREE_FLOW = gql`
  query flowGet($id: ID!) {
    flowGet(id: $id) {
      flow {
        id
        uuid
      }
      errors {
        key
        message
      }
    }
  }
`;

export const RELEASE_FLOW = gql`
  query flowRelease {
    flowRelease {
      id
      uuid
    }
  }
`;
