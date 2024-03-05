import { gql } from '@apollo/client';

export const GROUP_SEARCH_QUERY = gql`
  query WaSearch($filter: WaSearchFilter!, $waGroupOpts: Opts!, $waMessageOpts: Opts!) {
    search: waSearch(filter: $filter, waGroupOpts: $waGroupOpts, waMessageOpts: $waMessageOpts) {
      waGroup {
        bspId
        id
        label
        lastCommunicationAt
        waManagedPhone {
          id
          label
          phone
          phoneId
        }
      }
      messages: waMessages {
        id
        body
        insertedAt
        messageNumber
        type
        status
        media {
          url
          caption
        }
        contact {
          name
        }
        errors
        contextMessage {
          body
          contextId
          messageNumber
          errors
          media {
            caption
            sourceUrl
            id
            url
          }
          type
          insertedAt
        }
      }
    }
  }
`;

export const GROUP_SEARCH_MULTI_QUERY = gql`
  query WaSearchMulti($filter: WaSearchFilter!, $waGroupOpts: Opts!, $waMessageOpts: Opts!) {
    searchMulti: waSearchMulti(
      filter: $filter
      waGroupOpts: $waGroupOpts
      waMessageOpts: $waMessageOpts
    ) {
      groups: waGroups {
        bspId
        id
        name: label
        lastCommunicationAt
        waManagedPhone {
          id
          label
          phone
          phoneId
        }
      }
      messages: waMessages {
        id
        body
        insertedAt
        messageNumber
        type
        status
        contact {
          name
        }
        media {
          url
          caption
        }
        errors
        contextMessage {
          body
          contextId
          messageNumber
          errors
          media {
            caption
            sourceUrl
            id
            url
          }
          type
          insertedAt
        }
      }
    }
  }
`;

export const GET_WA_MANAGED_PHONES = gql`
  query WaManagedPhones($filter: WaManagedPhoneFilter, $opts: Opts) {
    waManagedPhones(filter: $filter, opts: $opts) {
      id
      phone
      label
    }
  }
`;

export const WA_GROUPS_CONTACT = gql`
  query WaGroupsContact {
    waGroupsContact {
      contact {
        id
        name
        maskedPhone
      }
      value
      id
    }
  }
`;

export const LIST_WA_GROUP_CONTACTS = gql`
  query ListContactWaGroup($filter: ContactWaGroupFilter, $opts: Opts) {
    listContactWaGroup(filter: $filter, opts: $opts) {
      id
      contact {
        id
        name
        maskedPhone
      }
    }
  }
`;
