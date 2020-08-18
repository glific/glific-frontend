import { gql } from '@apollo/client';

export const DELETE_USER = gql`
  mutation deleteUser($id: ID!) {
    deleteUser(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation updateUser($id: ID!, $input: UserInput!) {
    updateUser(id: $id, input: $input) {
      user {
        id
        name
        phone
        roles
        groups {
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

