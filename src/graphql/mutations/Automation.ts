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
        shortcode
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
        shortcode
      }
    }
  }
`;
