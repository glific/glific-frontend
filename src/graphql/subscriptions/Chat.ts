import { gql } from '@apollo/client';

export const MESSAGE_RECEIVED_SUBSCRIPTION = gql`
  subscription($organizationId: ID!) {
    receivedMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
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
    }
  }
`;

export const GROUP_SENT_SUBSCRIPTION = gql`
  subscription($organizationId: ID!) {
    sentGroupMessage(organizationId: $organizationId) {
      id
      body
      flow
      type
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
    }
  }
`;
