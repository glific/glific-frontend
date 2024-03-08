import { gql } from '@apollo/client';

export const CREATE_CONTACT_COLLECTION = gql`
  mutation createContactGroup($input: ContactGroupInput!) {
    createContactGroup(input: $input) {
      contactGroup {
        id
        value
      }
    }
  }
`;

export const UPDATE_CONTACT_COLLECTIONS = gql`
  mutation updateContactGroups($input: ContactGroupsInput!) {
    updateContactGroups(input: $input) {
      contactGroups {
        id
        value
      }
      numberDeleted
    }
  }
`;

export const DELETE_COLLECTION = gql`
  mutation deleteGroup($id: ID!) {
    deleteGroup(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_COLLECTION = gql`
  mutation createGroup($input: GroupInput!) {
    createGroup(input: $input) {
      group {
        id
        description
        label
      }
    }
  }
`;

export const CREATE_GROUP_COLLECTION = gql`
  mutation CreateWaGroupsCollection($input: WaGroupsCollectionInput!) {
    createWaGroupsCollection(input: $input) {
      errors {
        message
      }
      waGroupsCollection {
        group {
          label
          id
        }
      }
    }
  }
`;

export const UPDATE_COLLECTION = gql`
  mutation updateGroup($id: ID!, $input: GroupInput!) {
    updateGroup(id: $id, input: $input) {
      group {
        id
        label
        description
      }
    }
  }
`;

export const UPDATE_COLLECTION_USERS = gql`
  mutation updateGroupUsers($input: GroupUsersInput!) {
    updateGroupUsers(input: $input) {
      groupUsers {
        id
        value
      }
    }
  }
`;

export const UPDATE_COLLECTION_CONTACTS = gql`
  mutation updateGroupContacts($input: GroupContactsInput!) {
    updateGroupContacts(input: $input) {
      groupContacts {
        id
        value
      }
      numberDeleted
    }
  }
`;

export const UPDATE_COLLECTION_GROUPS = gql`
  mutation UpdateWaGroupCollection($input: UpdateWaGroupsCollectionInput!) {
    updateWaGroupCollection(input: $input) {
      collectionWaGroups {
        group {
          label
        }
      }
    }
  }
`;
