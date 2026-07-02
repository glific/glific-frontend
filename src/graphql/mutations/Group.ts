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

export const SEND_MESSAGE_IN_WA_GROUP_COLLECTION = gql`
  mutation SendMessageToWaGroupCollection($groupId: ID!, $input: CollectionWaMessageInput!) {
    sendMessageToWaGroupCollection(groupId: $groupId, input: $input) {
      errors {
        message
      }
      success
    }
  }
`;

export const SET_PRIMARY_PHONE = gql`
  mutation SetPrimaryPhone($waGroupId: ID!, $waManagedPhoneId: ID!) {
    setPrimaryPhone(waGroupId: $waGroupId, waManagedPhoneId: $waManagedPhoneId) {
      primaryPhone {
        id
        isPrimary
        isActive
        waManagedPhone {
          id
          phone
          label
          status
        }
      }
      warning
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_WA_GROUP = gql`
  mutation CreateWaGroup($input: CreateWaGroupInput!) {
    createWaGroup(input: $input) {
      waGroup {
        id
        label
        bspId
      }
      errors {
        key
        message
      }
    }
  }
`;

export const REMOVE_WA_GROUP_CONTACT = gql`
  mutation RemoveWaGroupContact($waGroupId: ID!, $contactId: ID!) {
    removeWaGroupContact(waGroupId: $waGroupId, contactId: $contactId) {
      waGroup {
        id
        label
        bspId
      }
      errors {
        key
        message
      }
    }
  }
`;

export const IMPORT_WA_GROUP_CONTACTS = gql`
  mutation ImportWaGroupContacts($waGroupId: ID!, $data: String!, $type: ImportContactsTypeEnum!) {
    importWaGroupContacts(waGroupId: $waGroupId, data: $data, type: $type) {
      status
      errors {
        message
      }
    }
  }
`;

export const SET_PRIMARY_PHONE_FOR_COLLECTION = gql`
  mutation SetPrimaryPhoneForCollection($collectionId: ID!, $waManagedPhoneId: ID!) {
    setPrimaryPhoneForCollection(collectionId: $collectionId, waManagedPhoneId: $waManagedPhoneId) {
      status
      userJobId
      errors {
        key
        message
      }
    }
  }
`;
