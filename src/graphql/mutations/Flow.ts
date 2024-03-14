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
        description
        uuid
        roles {
          id
          label
        }
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
        description
        uuid
        roles {
          id
          label
        }
        tag {
          label
          id
        }
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

export const ADD_FLOW_TO_WA_GROUP = gql`
  mutation StartWaGroupFlow($flowId: ID!, $waGroupId: ID!) {
    startWaGroupFlow(flowId: $flowId, waGroupId: $waGroupId) {
      errors {
        message
      }
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
        description
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
      status {
        flowName
        status
      }
    }
  }
`;

export const RESET_FLOW_COUNT = gql`
  mutation ResetFlowCount($flowId: ID!) {
    resetFlowCount(flowId: $flowId) {
      success
      errors {
        message
      }
    }
  }
`;

export const AUTO_TRANSLATE_FLOW = gql`
  mutation inlineFlowLocalization($id: ID!) {
    inlineFlowLocalization(id: $id) {
      success
      errors {
        key
        message
      }
    }
  }
`;

export const IMPORT_FLOW_LOCALIZATIONS = gql`
  mutation importFlowLocalization($localization: String!, $id: ID!) {
    importFlowLocalization(localization: $localization, id: $id) {
      success
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
