import { gql } from '@apollo/client';

export const DELETE_TAG = gql`
  mutation deleteTag($id: ID!) {
    deleteTag(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_TAG = gql`
  mutation creTag($input: TagInput!) {
    createTag(input: $input) {
      tag {
        id
        description
        label
        colorCode
        parent {
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

export const UPDATE_TAG = gql`
  mutation updateTag($id: ID!, $input: TagInput!) {
    updateTag(id: $id, input: $input) {
      tag {
        id
        label
        description
        colorCode
        parent {
          id
        }
      }
    }
  }
`;
