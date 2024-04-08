import { gql } from '@apollo/client';

export const SEARCH_QUERY = gql`
  query search($filter: SearchFilter!, $contactOpts: Opts!, $messageOpts: Opts!) {
    search(filter: $filter, contactOpts: $contactOpts, messageOpts: $messageOpts) {
      id
      contact {
        id
        name
        phone
        fields
        maskedPhone
        lastMessageAt
        status
        bspStatus
        isOrgRead
      }
      group {
        id
        label
      }
      messages {
        id
        body
        insertedAt
        messageNumber
        receiver {
          id
        }
        sender {
          id
        }
        location {
          latitude
          longitude
        }
        type
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
          location {
            id
            latitude
            longitude
          }
          receiver {
            id
          }
          sender {
            id
            name
          }
        }
        interactiveContent
        sendBy
        flowLabel
      }
    }
  }
`;

export const SAVED_SEARCH_QUERY = gql`
  query savedSearches($filter: SavedSearchFilter!, $opts: Opts) {
    savedSearches(filter: $filter, opts: $opts) {
      id
      shortcode
      label
      isReserved
      args
    }
  }
`;

export const SEARCH_MULTI_QUERY = gql`
  query searchMulti($searchFilter: SearchFilter!, $contactOpts: Opts!, $messageOpts: Opts!) {
    searchMulti(filter: $searchFilter, contactOpts: $contactOpts, messageOpts: $messageOpts) {
      contacts {
        id
        name
        phone
        maskedPhone
        lastMessageAt
        status
        bspStatus
        isOrgRead
      }
      messages {
        id
        body
        messageNumber
        insertedAt
        contact {
          id
          name
          phone
          maskedPhone
          lastMessageAt
          status
          bspStatus
        }
        receiver {
          id
        }
        sender {
          id
        }
        type
        media {
          url
          caption
        }
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
          location {
            id
            latitude
            longitude
          }
          receiver {
            id
          }
          sender {
            id
            name
          }
        }
      }
      labels {
        id
        body
        messageNumber
        insertedAt
        contact {
          id
          name
          phone
          maskedPhone
          lastMessageAt
          status
          bspStatus
        }
        receiver {
          id
        }
        sender {
          id
        }
        type
        media {
          url
          caption
        }
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
          location {
            id
            latitude
            longitude
          }
          receiver {
            id
          }
          sender {
            id
            name
          }
        }
      }
    }
  }
`;

export const SEARCH_OFFSET = gql`
  {
    offset @client
    search @client
  }
`;

export const SCROLL_HEIGHT = gql`
  {
    height @client
  }
`;

export const SEARCH_LIST_QUERY = gql`
  query savedSearches($filter: SavedSearchFilter!, $opts: Opts!) {
    savedSearches(filter: $filter, opts: $opts) {
      id
      shortcode
      label
      isReserved
      args
    }
  }
`;

export const SEARCH_QUERY_COUNT = gql`
  query countSavedSearches($filter: SavedSearchFilter!) {
    countSavedSearches(filter: $filter)
  }
`;

export const GET_SEARCH = gql`
  query savedSearches($id: ID!) {
    savedSearch(id: $id) {
      savedSearch {
        id
        shortcode
        label
        args
      }
    }
  }
`;

export const SEARCHES_COUNT = gql`
  query count($organizationId: ID!) {
    collectionStats(organizationId: $organizationId)
  }
`;
