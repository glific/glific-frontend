import { gql } from '@apollo/client';

export const WA_MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription ReceivedWaGroupMessage($organizationId: ID!) {
    receivedWaGroupMessage(organizationId: $organizationId) {
      id
      body
      insertedAt
      messageNumber
      flow
      type
      status
      waGroup {
        id
      }
      contact {
        name
      }
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
      }

      errors
    }
  }
`;

export const WA_MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription SentWaGroupMessage($organizationId: ID!) {
    sentWaGroupMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      messageNumber
      insertedAt
      waGroup {
        id
      }
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
      status
    }
  }
`;

export const SENT_MESSAGE_WA_GROUP_COLLECTION = gql`
  subscription SentWaGroupCollectionMessage($organizationId: ID!) {
    sentWaGroupCollectionMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      messageNumber
      insertedAt
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
      contact {
        name
      }
      waGroup {
        id
      }
      status
    }
  }
`;
