import { gql } from 'config/gql';

export const GET_LANGUAGES = gql`
  query languages($opts: Opts) {
    languages(opts: $opts) {
      id
      label
    }
  }
`;

export default GET_LANGUAGES;
