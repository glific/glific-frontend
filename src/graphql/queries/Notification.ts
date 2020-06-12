import { gql } from '@apollo/client';

export const NOTIFICATION = gql`
  {
    message @client
  }
`;
