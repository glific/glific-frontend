import { gql } from '@apollo/client';

export const GET_CONTACT_GROUPS = gql`
  query contact($id: ID!) {
    contact(id: $id) {
      contact {
        groups {
          id
        }
      }
    }
  }
`;
