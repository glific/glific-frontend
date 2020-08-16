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
  mutation updateUser($id: ID!, $input: UserInput!, $groupIds: [ID]!) {
    updateUser(id: $id, input: $input, groupIds: $groupIds) {
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

export const ADD_USER_TO_GROUP = gql`
  mutation createUserGroup($input: UserGroupInput!) {
    createUserGroup(input: $input) {
      userGroup {
        id
        user {
          id
          name
        }
        group {
          id
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
