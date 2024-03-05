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
  mutation SyncContactWaGroups {
    syncContactWaGroups {
      errors {
        key
        message
      }
    }
  }
`;

export const UPDATE_GROUP_CONTACT = gql`
  mutation UpdateContactWaGroups($input: UpdateContactWaGroupsInput!) {
    updateContactWaGroups(input: $input) {
      numberDeleted
      waGroupContacts {
        id
      }
    }
  }
`;

export const CREATE_GROUP_CONTACT = gql`
  mutation CreateContactWaGroup($input: ContactWaGroupInput!) {
    createContactWaGroup(input: $input) {
      contactWaGroup {
        contact {
          name
        }
        id
      }
    }
  }
`;
