import { gql } from '@apollo/client';

export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    receivedMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      groupId
      messageNumber
      location {
        latitude
        longitude
      }
      insertedAt
      receiver {
        id
        phone
      }
      sender {
        id
        phone
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
      flowLabel
      sendBy
    }
  }
`;

export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    sentMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      groupId
      messageNumber
      location {
        latitude
        longitude
      }
      insertedAt
      receiver {
        id
        phone
      }
      sender {
        id
        phone
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
      flowLabel
      sendBy
    }
  }
`;

export const MESSAGE_STATUS_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    updateMessageStatus(organizationId: $organizationId) {
      id
      receiver {
        id
      }
      errors
    }
  }
`;

export const COLLECTION_SENT_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    sentGroupMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      groupId
      messageNumber
      location {
        latitude
        longitude
      }
      insertedAt
      receiver {
        id
        phone
      }
      sender {
        id
        phone
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
      flowLabel
      sendBy
    }
  }
`;
