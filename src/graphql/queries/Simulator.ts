import { gql } from '@apollo/client';

export const GET_SIMULATOR = gql`
  query MyQuery {
    simulatorGet {
      id
      phone
    }
  }
`;
