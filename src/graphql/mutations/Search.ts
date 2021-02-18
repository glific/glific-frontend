import { gql } from '@apollo/client';

export const CREATE_SEARCH = gql`
  mutation createSavedSearch($input: SavedSearchInput!) {
    createSavedSearch(input: $input) {
      savedSearch {
        id
        label
        shortcode
        args
      }
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_SEARCH = gql`
  mutation updateSavedSearch($id: ID!, $input: SavedSearchInput!) {
    updateSavedSearch(id: $id, input: $input) {
      savedSearch {
        id
        label
        shortcode
        args
      }
      errors {
        key
        message
      }
    }
  }
`;

export const DELETE_SEARCH = gql`
  mutation deleteSavedSearch($id: ID!) {
    deleteSavedSearch(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;
