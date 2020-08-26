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
        shortcode
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
        shortcode
      }
      errors {
        key
        message
      }
    }
  }
`;
