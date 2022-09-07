import { gql } from '@apollo/client';

export const GET_COLLECTION = gql`
  query getGroup($id: ID!) {
    group(id: $id) {
      group {
        id
        label
        roles {
          id
          label
        }
        description
        users {
          id
          name
        }
      }
    }
  }
`;

export const GET_COLLECTIONS_COUNT = gql`
  query countGroups($filter: GroupFilter!) {
    countGroups(filter: $filter)
  }
`;

export const FILTER_COLLECTIONS = gql`
  query groups($filter: GroupFilter!, $opts: Opts!) {
    groups(filter: $filter, opts: $opts) {
      id
      label
      description
      isRestricted
      contactsCount
      roles {
        id
        label
      }
    }
  }
`;

export const GET_COLLECTIONS = gql`
  query groups($filter: GroupFilter, $opts: Opts) {
    groups(filter: $filter, opts: $opts) {
      id
      label
      isRestricted
    }
  }
`;

export const GET_COLLECTION_USERS = gql`
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

export const GET_COLLECTION_INFO = gql`
  query groupInfo($id: ID!) {
    groupInfo(id: $id)
  }
`;

export const GET_ORGANIZATION_COLLECTIONS = gql`
  query OrganizationGroups($organizationGroupsId: ID!, $filter: GroupFilter, $opts: Opts) {
    organizationGroups(id: $organizationGroupsId, filter: $filter, opts: $opts) {
      label
      id
    }
  }
`;
