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
        isPinned
        description
        roles {
          id
          label
        }
        tag {
          label
          id
        }
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
      description
      lastChangedAt
      isBackground
      lastPublishedAt
      ignoreKeywords
      updatedAt
      isActive
      isPinned
      roles {
        id
        label
      }
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

export const GET_FREE_FLOW = gql`
  query flowGet($id: ID!, $isForced: Boolean) {
    flowGet(id: $id, isForced: $isForced) {
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

export const EXPORT_FLOW_LOCALIZATIONS = gql`
  query exportFlowLocalization($id: ID!, $addTranslation: Boolean) {
    exportFlowLocalization(id: $id,  addTranslation: $addTranslation) {
      exportData
    }
  }
`;
