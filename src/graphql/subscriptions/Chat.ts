import { gql } from '@apollo/client';

export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription($organizationId: ID!) {
    receivedMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      insertedAt
      receiver {
        id
        phone
      }
      sender {
        id
        phone
      }
      tags {
        id
        label
        colorCode
      }
      media {
        url
        caption
      }
    }
  }
`;

export const MESSAGE_SENT_SUBSCRIPTION = gql`
  subscription($organizationId: ID!) {
    sentMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      insertedAt
      receiver {
        id
        phone
      }
      sender {
        id
        phone
      }
      tags {
        id
        label
        colorCode
      }
    }
  }
`;
