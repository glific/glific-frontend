import { gql } from '@apollo/client';

export const GET_USERS_QUERY = gql`
  query user($id: ID!) {
    user(id: $id) {
      user {
        id
        name
        phone
        isRestricted
        accessRoles {
          id
          label
        }
        groups {
          id
          label
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
      accessRoles {
        label
      }
      groups {
        id
        label
      }
      contact {
        id
      }
    }
  }
`;

export const GET_USER_ROLES = gql`
  query {
    roles
  }
`;

export const GET_USERS = gql`
  query users($filter: UserFilter, $opts: Opts) {
    users(filter: $filter, opts: $opts) {
      id
      name
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query currentUser {
    currentUser {
      user {
        id
        name
        phone
        accessRoles {
          id
          label
        }
        contact {
          id
          name
          phone
        }
        groups {
          id
          label
          description
        }
        organization {
          id
          contact {
            phone
          }
        }
        language {
          id
          locale
        }
      }
    }
  }
`;
