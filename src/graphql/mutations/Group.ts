import { gql } from '@apollo/client';

export const CREATE_CONTACT_GROUP = gql`
  mutation createContactGroup($input: ContactGroupInput!) {
    createContactGroup(input: $input) {
      contactGroup {
        id
        value
      }
    }
  }
`;
