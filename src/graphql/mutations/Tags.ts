import { gql } from '@apollo/client';

export const CREATE_LABEL = gql`
  mutation CreateTag($input: TagInput!) {
    createTag(input: $input) {
      tag {
        id
        label
      }
      errors {
        message
        key
      }
    }
  }
`;

export const UPDATE_TAG = gql`
  mutation UpdateTag($id: ID!) {
    updateTag(id: $id) {
      tag {
        label
      }
    }
  }
`;

export const DELETE_TAG = gql`
  mutation DeleteTag($id: ID!) {
    deleteTag(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;
