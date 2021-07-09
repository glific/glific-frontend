import { gql } from '@apollo/client';

export const CREATE_INTERACTIVE = gql`
  mutation createInteractive($input: interactiveInput!) {
    createInteractive(input: $input) {
      interactive {
        type
        label
        interactiveContent
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_INTERACTIVE = gql`
  mutation updateInteractive($id: ID!, $input: interactiveInput!) {
    updateInteractive(id: $id, input: $input) {
      interactive {
        insertedAt
        interactiveContent
        label
        type
        updatedAt
        id
      }
      errors {
        key
        message
      }
    }
  }
`;

export const DELETE_INTERACTIVE = gql`
  mutation deleteInteractive($id: ID!) {
    deleteInteractive(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;
