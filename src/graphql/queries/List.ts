import { gql } from '@apollo/client';

export const GET_LANGUAGES = gql`
  query languages($opts: Opts) {
    languages(opts: $opts) {
      id
      label
    }
  }
`;
