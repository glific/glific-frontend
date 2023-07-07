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
