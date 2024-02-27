import { gql } from '@apollo/client';

export const GROUP_SEARCH_QUERY = gql`
  query WaSearch($filter: WaSearchFilter!, $waGroupOpts: Opts!, $waMessageOpts: Opts!) {
    search: waSearch(filter: $filter, waGroupOpts: $waGroupOpts, waMessageOpts: $waMessageOpts) {
      waGroup {
        bspId
        id
        label
        lastMessageAt: lastCommunicationAt
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
