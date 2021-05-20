import { FILTER_NOTIFICATIONS, GET_NOTIFICATIONS_COUNT } from '../graphql/queries/Notifications';
import { MARK_NOTIFICATIONS_AS_READ } from '../graphql/mutations/Notifications';

export const getNotificationsQuery = {
  request: {
    query: FILTER_NOTIFICATIONS,
    variables: {
      filter: {},
      opts: { limit: 50, offset: 0, order: 'ASC', orderWith: 'updated_at' },
    },
  },
  result: {
    data: {
      notifications: [
        {
          id: '1',
          category: 'Message',
          entity:
            '{"status":"valid","phone":"9876543210_1","name":"Glific Simulator One","last_message_at":"2021-03-22T07:25:12Z","is_hsm":null,"id":2,"group_id":null,"flow_id":null,"bsp_status":"hsm"}',
          message: 'Cannot send session message to contact, invalid bsp status.',
          severity: '"Error"',
          updatedAt: '2021-03-24T07:50:22Z',
          isRead: false,
        },
      ],
    },
  },
};
export const getUnFitleredNotificationCountQuery = {
  request: {
    query: GET_NOTIFICATIONS_COUNT,
    variables: {
      filter: {},
    },
  },
  result: {
    data: {
      countNotifications: 2,
    },
  },
};

export const getNotificationCountQuery = {
  request: {
    query: GET_NOTIFICATIONS_COUNT,
    variables: {
      filter: {
        is_read: false,
      },
    },
  },
  result: {
    data: {
      countNotifications: 2,
    },
  },
};

export const markAllNotificationAsRead = {
  request: {
    query: MARK_NOTIFICATIONS_AS_READ,
  },
  result: {
    data: {
      markNotificationAsRead: true,
    },
  },
};
