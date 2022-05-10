import { gql } from '@apollo/client';

export const FILTER_ROLES = gql`
  query AccessRoles($opts: Opts, $filter: AccessRoleFilter) {
    accessRoles(opts: $opts, filter: $filter) {
      id
      description
      insertedAt
      isReserved
      label
    }
  }
`;

export const COUNT_ROLES = gql`
  query CountAccessRoles($filter: AccessRoleFilter) {
    countAccessRoles(filter: $filter)
  }
`;
export const GET_ROLE = gql`
  query AccessRole($id: ID!) {
    accessRole(id: $id) {
      accessRole {
        description
        insertedAt
        isReserved
        label
      }
    }
  }
`;
