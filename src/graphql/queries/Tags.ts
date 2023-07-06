import { gql } from '@apollo/client';

export const GET_TAGS = gql`
  query Tags {
    tags {
      label
      id
    }
  }
`;