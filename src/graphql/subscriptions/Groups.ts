import { gql } from '@apollo/client';

export const WA_MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    receivedWaGroupMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      waGroupId
      messageNumber
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
      media {
        url
        caption
      }
      insertedAt
      errors
      status
    }
  }
`;

export const WA_MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    sentWaGroupMessage(organizationId: $organizationId) {
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
      status
      waGroupId
    }
  }
`;
