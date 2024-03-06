import { gql } from '@apollo/client';

export const GROUP_SEARCH_QUERY = gql`
  query WaSearch($filter: WaSearchFilter!, $waGroupOpts: Opts!, $waMessageOpts: Opts!) {
    search: waSearch(filter: $filter, waGroupOpts: $waGroupOpts, waMessageOpts: $waMessageOpts) {
      group {
        id
        label
      }
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

export const LIST_WA_GROUP_CONTACTS = gql`
  query ListContactWaGroup($opts: Opts, $filter: ContactWaGroupFilter) {
    ContactWaGroup: listContactWaGroup(opts: $opts, filter: $filter) {
      id
      contact {
        id
        name
        phone
      }
      waGroup {
        id
        label
      }
    }
  }
`;

export const COUNT_WA_GROUP_CONTACTS = gql`
  query countContactWaGroup($filter: ContactWaGroupFilter) {
    countContactWaGroup(filter: $filter)
  }
`;
