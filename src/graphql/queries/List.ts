import { gql } from '@apollo/client';

export const GET_LANGUAGES = gql`
  {
    languages {
      id
      label
    }
  }
`;
