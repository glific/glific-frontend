import { gql } from '@apollo/client';

export const DELETE_AUTOMATION = gql`
  mutation deleteFlow($id: ID!) {
    deleteFlow(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_AUTOMATION = gql`
  mutation createFlow($input: FlowInput!) {
    createFlow(input: $input) {
      flow {
        id
        name
        uuid
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_AUTOMATION = gql`
  mutation updateFlow($id: ID!, $input: FlowInput!) {
    updateFlow(id: $id, input: $input) {
      flow {
        id
        name
        uuid
      }
      errors {
        key
        message
      }
    }
  }
`;

export const PUBLISH_AUTOMATION = gql`
  mutation publishFlow($uuid: UUID!) {
    publishFlow(uuid: $uuid) {
      success
    }
  }
`;

export const ADD_AUTOMATION_TO_GROUP = gql`
  mutation startGroupFlow($flowId: ID!, $groupId: ID!) {
    startGroupFlow(flowId: $flowId, groupId: $groupId) {
      success
    }
  }
`;

export const ADD_AUTOMATION_TO_CONTACT = gql`
  mutation startContactFlow($flowId: ID!, $contactId: ID!) {
    startContactFlow(flowId: $flowId, contactId: $contactId) {
      success
    }
  }
`;

export const CREATE_AUTOMATION_COPY = gql`
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
