import { gql } from '@apollo/client';

export const GET_USERS_QUERY = gql`
  query users($filter: UserFilter, $opts: Opts) {
    users(filter: $filter, opts: $opts) {
      id
      name
      phone
      roles
    }
  }
`;

export const USER_COUNT = gql`
  query countUsers($filter: UserFilter) {
    countUsers(filter: $filter)
  }
`;

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

export const FILTER_USERS = gql`
  query users($filter: UserFilter, $opts: Opts) {
    users(filter: $filter, opts: $opts) {
      id
      name
      phone
      roles
    }
  }
`;
