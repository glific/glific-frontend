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
        isActive
        isReserved
        language {
          id
        }
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
        isActive
        isReserved
        description
        language {
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
