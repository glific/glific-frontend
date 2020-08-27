import { gql } from '@apollo/client';

export const CREATE_COLLECTION = gql`
  mutation createSavedSearch($input: SavedSearchInput!) {
    createSavedSearch(input: $input) {
      savedSearch {
        id
        label
        shortcode
        args
        count
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_COLLECTION = gql`
  mutation updateSavedSearch($id: ID!, $input: SavedSearchInput!) {
    updateSavedSearch(id: $id, input: $input) {
      savedSearch {
        id
        label
      }
      errors {
        key
        message
      }
    }
  }
`;

export const DELETE_COLLECTION = gql`
  mutation deleteSavedSearch($id: ID!) {
    deleteSavedSearch(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;
