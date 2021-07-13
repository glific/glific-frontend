import { gql } from '@apollo/client';

export const CREATE_INTERACTIVE = gql`
  mutation createInteractiveTemplate($input: interactiveTemplateInput!) {
    createInteractiveTemplate(input: $input) {
      interactiveTemplate {
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
  mutation updateInteractiveTemplate($id: ID!, $input: interactiveTemplateInput!) {
    updateInteractiveTemplate(id: $id, input: $input) {
      interactiveTemplate {
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
  mutation deleteInteractiveTemplate($id: ID!) {
    deleteInteractiveTemplate(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;
