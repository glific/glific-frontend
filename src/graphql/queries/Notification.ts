import { gql } from '@apollo/client';

export const NOTIFICATION = gql`
  {
    message @client
    severity @client
  }
`;

export const ERROR_MESSAGE = gql`
  {
    errorMessage @client
  }
`;
