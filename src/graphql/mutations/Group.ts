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

export const UPDATE_CONTACT_GROUPS = gql`
  mutation updateContactGroups($input: ContactGroupsInput!) {
    updateContactGroups(input: $input) {
      contactGroups {
        id
        value
      }
    }
  }
`;

export const DELETE_GROUP = gql`
  mutation deleteGroup($id: ID!) {
    deleteGroup(id: $id) {
      errors {
        key
        message
      }
    }
  }
`;

export const CREATE_GROUP = gql`
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

export const UPDATE_GROUP = gql`
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

export const UPDATE_GROUP_USERS = gql`
  mutation updateGroupUsers($input: GroupUsersInput!) {
    updateGroupUsers(input: $input) {
      groupUsers {
        id
        value
      }
    }
  }
`;

export const UPDATE_GROUP_CONTACTS = gql`
  mutation updateGroupContacts($input: GroupContactsInput!) {
    updateGroupContacts(input: $input) {
      groupContacts {
        id
        value
      }
    }
  }
`;
