import { gql } from '@apollo/client';

export const GROUP_SEARCH_QUERY = gql`
  query search($filter: SearchFilter!, $contactOpts: Opts!, $messageOpts: Opts!) {
    search(filter: $filter, contactOpts: $contactOpts, messageOpts: $messageOpts) {
      group {
        bspId
        name
        phone
        participants
        admins
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
