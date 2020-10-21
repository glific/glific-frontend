import { gql } from '@apollo/client';

export const GET_GROUP = gql`
  query getGroup($id: ID!) {
    group(id: $id) {
      group {
        id
        label
        description
        users {
          id
          name
        }
      }
    }
  }
`;

export const GET_GROUPS_COUNT = gql`
  query countGroups($filter: GroupFilter!) {
    countGroups(filter: $filter)
  }
`;

export const FILTER_GROUPS = gql`
  query groups($filter: GroupFilter!, $opts: Opts!) {
    groups(filter: $filter, opts: $opts) {
      id
      label
      description
      isRestricted
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

export const GET_GROUP_USERS = gql`
  query group($id: ID!) {
    group(id: $id) {
      group {
        users {
          id
          name
        }
      }
    }
  }
`;
