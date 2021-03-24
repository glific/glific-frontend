import { gql } from '@apollo/client';

export const FILTER_NOTIFICATIONS = gql`
  query notifications($filter: NotificationFilter, $opts: Opts) {
    notifications(filter: $filter, opts: $opts) {
      category
      entity
      message
      severity
      updatedAt
    }
  }
`;

export const GET_NOTIFICATIONS_COUNT = gql`
  query countNotifications($filter: NotificationFilter) {
    countNotifications(filter: $filter)
  }
`;
