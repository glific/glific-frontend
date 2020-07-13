import { gql } from '@apollo/client';

export const NOTIFICATION = gql`
  {
    message @client
  }
`;

export const ERROR = gql`
  {
    message @client
  }
`;