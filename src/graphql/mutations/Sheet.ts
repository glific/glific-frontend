import { gql } from '@apollo/client';

export const DELETE_SHEET = gql`
  mutation DeleteSheet($id: ID!) {
    deleteSheet(id: $id) {
      errors {
        message
        key
      }
      sheet {
        insertedAt
        isActive
        label
        lastSyncedAt
        updatedAt
        url
        id
      }
    }
  }
`;

export const CREATE_SHEET = gql`
  mutation ($input: SheetInput!) {
    createSheet(input: $input) {
      sheet {
        insertedAt
        id
        isActive
        label
        lastSyncedAt
        updatedAt
        url
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_SHEET = gql`
  mutation UpdateSheet($id: ID!, $input: SheetInput!) {
    updateSheet(id: $id, input: $input) {
      sheet {
        id
        isActive
        label
        lastSyncedAt
        updatedAt
        url
        insertedAt
      }
      errors {
        key
        message
      }
    }
  }
`;
