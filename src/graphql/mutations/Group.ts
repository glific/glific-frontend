import { gql } from '@apollo/client';

export const CREATE_CONTACT_GROUP = gql`
  mutation createContactGroup($input: ContactGroupInput!) {
    createContactGroup(input: $input) {
      contactGroup {
        id
        value
      }
    }
  }
`;
export const DELETE_GROUP = gql`
  mutation deleteGroup($id: ID!) {
    deleteGroup(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_GROUP = gql`
  mutation createGroup($input: GroupInput!) {
    createGroup(input: $input) {
      group {
        id
        description
        label
      }
    }
  }
`;

export const UPDATE_GROUP = gql`
  mutation updateGroup($id: ID!, $input: GroupInput!) {
    updateGroup(id: $id, input: $input) {
      group {
        id
        label
        description
      }
    }
  }
`;
