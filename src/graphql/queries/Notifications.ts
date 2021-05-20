import { gql } from '@apollo/client';

export const FILTER_NOTIFICATIONS = gql`
  query notifications($filter: NotificationFilter, $opts: Opts) {
    notifications(filter: $filter, opts: $opts) {
      id
      category
      entity
      message
      severity
      updatedAt
      isRead
    }
  }
`;

export const GET_NOTIFICATIONS_COUNT = gql`
  query countNotifications($filter: NotificationFilter) {
    countNotifications(filter: $filter)
  }
`;
