import { gql } from '@apollo/client';

export const ADD_MESSAGE_TAG_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    createdMessageTag(organizationId: $organizationId) {
      message {
        id
        flow
        receiver {
          id
        }
        sender {
          id
        }
        media {
          url
          caption
        }
      }
      tag {
        id
        label
        colorCode
      }
    }
  }
`;

export const DELETE_MESSAGE_TAG_SUBSCRIPTION = gql`
  subscription ($organizationId: ID!) {
    deletedMessageTag(organizationId: $organizationId) {
      message {
        id
        flow
        receiver {
          id
        }
        sender {
          id
        }
        media {
          url
          caption
        }
      }
      tag {
        id
        label
        colorCode
      }
    }
  }
`;
