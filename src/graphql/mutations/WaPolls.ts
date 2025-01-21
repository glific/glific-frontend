import { gql } from '@apollo/client';

export const CREATE_POLL = gql`
  mutation CreateWaPoll($input: WaPollInput!) {
    createWaPoll(input: $input) {
      errors {
        message
      }
      waPoll {
        id
      }
    }
  }
`;

export const COPY_POLL = gql`
  mutation CopyWaPoll($input: WaPollInput, $id: ID!) {
    copyWaPoll(input: $input, id: $id) {
      waPoll {
        id
        label
      }
    }
  }
`;

export const DELETE_POLL = gql`
  mutation DeleteWaPoll($deleteWaPollId: ID!) {
    deleteWaPoll(id: $deleteWaPollId) {
      errors {
        message
      }
      waPoll {
        id
        label
      }
    }
  }
`;
