import { gql } from '@apollo/client';

export const DELETE_ROLE = gql`
  mutation DeleteRole($deleteRoleId: ID!) {
    deleteAccessRole(id: $deleteRoleId) {
      accessRole {
        id
      }
    }
  }
`;

export const CREATE_ROLE = gql`
  mutation CreateRole($input: AccessRoleInput!) {
    createAccessRole(input: $input) {
      accessRole {
        description
        id
        isReserved
        label
      }
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($id: ID!, $input: AccessRoleInput) {
    updateAccessRole(id: $id, input: $input) {
      accessRole {
        description
        id
        isReserved
        label
      }
    }
  }
`;
