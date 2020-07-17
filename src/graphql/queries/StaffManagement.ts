import { gql } from '@apollo/client';

export const GET_USERS_QUERY = gql`
  query users($filter: UserFilter, $opts: Opts) {
    users(filter: $filter, opts: $opts) {
      id
      name
      phone
      roles
    }
  }
`;
