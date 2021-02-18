import { gql } from '@apollo/client';

export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription($organizationId: ID!) {
    receivedMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      isRead
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
      tags {
        id
        label
        colorCode
      }
      media {
        url
        caption
      }
      errors
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
      isRead
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
      tags {
        id
        label
        colorCode
      }
      media {
        url
        caption
      }
      errors
    }
  }
`;

export const MESSAGE_STATUS_SUBSCRIPTION = gql`
  subscription($organizationId: ID!) {
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
  subscription($organizationId: ID!) {
    sentGroupMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
      isRead
      groupId
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
      tags {
        id
        label
        colorCode
      }
      media {
        url
        caption
      }
      errors
    }
  }
`;
