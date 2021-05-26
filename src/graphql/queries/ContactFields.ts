import { gql } from '@apollo/client';

export const GET_ALL_CONTACT_FIELDS = gql`
  query contactsFields($filter: ContactsFieldFilter, $opts: Opts) {
    contactsFields(filter: $filter, opts: $opts) {
      valueType
      updatedAt
      shortcode
      scope
      name
      insertedAt
      id
      organization {
        shortcode
        isApproved
        isActive
      }
    }
  }
`;

export const GET_CONTACT_FIELD_BY_ID = gql`
  query contacts_field($id: ID!) {
    contacts_field(id: $id) {
      contacts_field {
        valueType
        updatedAt
        shortcode
        scope
        name
        insertedAt
        id
        organization {
          shortcode
          isApproved
          isActive
        }
      }
    }
  }
`;

export const COUNT_CONTACT_FIELDS = gql`
  query countContactsFields($filter: ContactsFieldFilter) {
    countContactsFields(filter: $filter)
  }
`;
