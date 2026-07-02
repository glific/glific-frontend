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
        primaryPhone {
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
        waManagedPhone {
          id
          phone
          label
          contact {
            name
          }
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
        pollContent
        poll {
          id
          pollContent
          allowMultipleAnswer
        }
      }
    }
  }
`;

export const GROUP_SEARCH_MULTI_QUERY = gql`
  query WaSearchMulti($filter: WaSearchFilter!, $waGroupOpts: Opts!, $waMessageOpts: Opts!) {
    searchMulti: waSearchMulti(filter: $filter, waGroupOpts: $waGroupOpts, waMessageOpts: $waMessageOpts) {
      groups: waGroups {
        bspId
        id
        name: label
        lastCommunicationAt
        primaryPhone {
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
      status
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
        primaryPhone {
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

export const GET_WA_GROUP = gql`
  query WaGroup($waGroupId: ID!) {
    waGroup(id: $waGroupId) {
      waGroup {
        label
        id
        lastCommunicationAt
        bspId
        fields
        primaryPhone {
          phone
          id
        }
        phones {
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
        groups {
          id
          label
          users {
            name
          }
        }
      }
    }
  }
`;

export const GET_WA_MANAGED_PHONES_STATUS = gql`
  query WaManagedPhones {
    waManagedPhones {
      status
      phone
    }
  }
`;

export const WA_GROUP_COLLECTION_PRIMARY_REPORT = gql`
  query WaGroupCollectionPrimaryReport($userJobId: ID!) {
    waGroupCollectionPrimaryReport(userJobId: $userJobId) {
      csvRows
      error
    }
  }
`;
