import { gql } from '@apollo/client';

export const NOTIFICATION = gql`
  {
    message @client
    severity @client
    hideDuration @client
  }
`;

export const ERROR_MESSAGE = gql`
  {
    errorMessage @client
  }
`;
