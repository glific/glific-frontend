import { gql } from '@apollo/client';

export const DELETE_FLOW = gql`
  mutation deleteFlow($id: ID!) {
    deleteFlow(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_FLOW = gql`
  mutation createFlow($input: FlowInput!) {
    createFlow(input: $input) {
      flow {
        id
        name
        isActive
        uuid
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_FLOW = gql`
  mutation updateFlow($id: ID!, $input: FlowInput!) {
    updateFlow(id: $id, input: $input) {
      flow {
        id
        name
        isActive
        uuid
      }
      errors {
        key
        message
      }
    }
  }
`;

export const PUBLISH_FLOW = gql`
  mutation publishFlow($uuid: UUID4!) {
    publishFlow(uuid: $uuid) {
      success
      errors {
        message
      }
    }
  }
`;

export const ADD_FLOW_TO_COLLECTION = gql`
  mutation startGroupFlow($flowId: ID!, $groupId: ID!) {
    startGroupFlow(flowId: $flowId, groupId: $groupId) {
      success
    }
  }
`;

export const ADD_FLOW_TO_CONTACT = gql`
  mutation startContactFlow($flowId: ID!, $contactId: ID!) {
    startContactFlow(flowId: $flowId, contactId: $contactId) {
      success
    }
  }
`;

export const CREATE_FLOW_COPY = gql`
  mutation copyFlow($id: ID!, $input: FlowInput!) {
    copyFlow(id: $id, input: $input) {
      flow {
        id
        name
        keywords
        uuid
      }
      errors {
        key
        message
      }
    }
  }
`;

export const IMPORT_FLOW = gql`
  mutation importFlow($flow: Json!) {
    importFlow(flow: $flow) {
      success
      errors {
        key
        message
      }
    }
  }
`;
