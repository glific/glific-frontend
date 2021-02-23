import { gql } from '@apollo/client';

export const GET_SIMULATOR = gql`
  query MyQuery {
    simulatorGet {
      id
      phone
      name
    }
  }
`;

export const RELEASE_SIMULATOR = gql`
  query MyQuery {
    simulatorRelease {
      id
    }
  }
`;
