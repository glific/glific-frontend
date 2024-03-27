import { gql } from '@apollo/client';

export const GROUP_SEARCH_QUERY = gql`
  query WaSearch($filter: WaSearchFilter!, $waGroupOpts: Opts!, $waMessageOpts: Opts!) {
    search: waSearch(filter: $filter, waGroupOpts: $waGroupOpts, waMessageOpts: $waMessageOpts) {
      id
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
        waGroup {
          name: label
          id
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

export const GET_GROUP_COUNT = gql`
  query waGroupsCount($filter: WaGroupFilter) {
    countWaGroups: waGroupsCount(filter: $filter)
  }
`;

export const GET_WA_GROUPS = gql`
  query WaGroups($filter: WaGroupFilter, $opts: Opts) {
    waGroups(filter: $filter, opts: $opts) {
      bspId
      id
      lastCommunicationAt
      name: label
    }
  }
`;

export const LIST_CONTACTS_WA_GROUPS = gql`
  query ListContactWaGroup($filter: ContactWaGroupFilter) {
    waGroupContact: listContactWaGroup(filter: $filter) {
      id
      isAdmin
      contact {
        id
        name
        phone
        waGroups {
          label
        }
      }
      waGroup {
        id
        label
        waManagedPhone {
          phone
        }
      }
    }
  }
`;

export const COUNT_COUNTACTS_WA_GROUPS = gql`
  query CountContactWaGroup($filter: ContactWaGroupFilter) {
    countWaGroupContact: countContactWaGroup(filter: $filter)
  }
`;
