import { gql } from '@apollo/client';

export const GET_USERS_QUERY = gql`
  query user($id: ID!) {
    user(id: $id) {
      user {
        id
        name
        phone
        roles
        groups {
          id
        }
      }
    }
  }
`;

export const USER_COUNT = gql`
  query countUsers($filter: UserFilter) {
    countUsers(filter: $filter)
  }
`;

export const FILTER_USERS = gql`
  query users($filter: UserFilter, $opts: Opts) {
    users(filter: $filter, opts: $opts) {
      id
      name
      phone
      roles
      groups {
        id
      }
    }
  }
`;

export const GET_GROUPS = gql`
  query groups($filter: GroupFilter, $opts: Opts) {
    groups(filter: $filter, opts: $opts) {
      id
      label
      isRestricted
    }
  }
`;
