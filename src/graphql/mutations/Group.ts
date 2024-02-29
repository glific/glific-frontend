import { gql } from '@apollo/client';

export const SEND_MESSAGE_IN_WA_GROUP = gql`
  mutation SendMessageInWaGroup($input: WaMessageInput!) {
    sendMessageInWaGroup(input: $input) {
      errors {
        key
        message
      }
    }
  }
`;

export const SYNC_GROUPS = gql`
  mutation SyncWaGroupContacts {
    syncWaGroupContacts {
      message
      errors {
        message
      }
    }
  }
`;

export const UPDATE_GROUP_CONTACT = gql`
  mutation UpdateWaGroupContacts($input: WaGroupContactsInput!) {
    updateWaGroupContacts(input: $input) {
      numberDeleted
      waGroupContacts {
        contact {
          name
          maskedPhone
        }
        id
        value
      }
    }
  }
`;
