import { gql } from '@apollo/client';

export const GET_LANGUAGES_COUNT = gql`
  query count_languages {
    countLanguages
  }
`;

export const GET_LANGUAGES_QUERY = gql`
  query languages {
    languages {
      label
    }
  }
`;
