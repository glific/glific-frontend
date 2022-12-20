import { FILTER_NOTIFICATIONS, GET_NOTIFICATIONS_COUNT } from 'graphql/queries/Notifications';
import { MARK_NOTIFICATIONS_AS_READ } from 'graphql/mutations/Notifications';

export const getNotificationsQuery = {
  request: {
    query: FILTER_NOTIFICATIONS,
    variables: {
      filter: { severity: '' },
      opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'updated_at' },
    },
  },
  result: {
    data: {
      notifications: [
        {
          category: 'Message',
          entity:
            '{"status":"valid","phone":"8535124479","name":"Adelle Cavin","last_message_at":"2021-05-19T14:01:17Z","is_hsm":false,"id":9,"group_id":null,"flow_id":null,"bsp_status":"hsm"}',

          id: '15',
          isRead: false,
          message: 'Could not send message to contact: Check Gupshup Setting',
          severity: '"Critical"',
          updatedAt: '2021-05-20T12:06:26Z',
        },
      ],
    },
  },
};

export const getFilteredNotificationsQuery = {
  request: {
    query: FILTER_NOTIFICATIONS,
    variables: {
      filter: { severity: 'Warning' },
      opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'updated_at' },
    },
  },
  result: {
    data: {
      notifications: [
        {
          category: 'Message',
          entity:
            '{"status":"valid","phone":"8535124479","name":"Adelle Cavin","last_message_at":"2021-05-19T14:01:17Z","is_hsm":false,"id":9,"group_id":null,"flow_id":null,"bsp_status":"hsm"}',

          id: '15',
          isRead: false,
          message: 'Could not send message to contact: Check Gupshup Setting',
          severity: '"Warning"',
          updatedAt: '2021-05-20T12:06:26Z',
        },
      ],
    },
  },
};

export const getInfoNotificationsQuery = {
  request: {
    query: FILTER_NOTIFICATIONS,
    variables: {
      filter: { severity: 'Info' },
      opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'updated_at' },
    },
  },
  result: {
    data: {
      notifications: [
        {
          category: 'Message',
          entity:
            '{"status":"valid","phone":"8535124479","name":"Adelle Cavin","last_message_at":"2021-05-19T14:01:17Z","is_hsm":false,"id":9,"group_id":null,"flow_id":null,"bsp_status":"hsm"}',

          id: '15',
          isRead: false,
          message: 'Could not send message to contact: Check Gupshup Setting',
          severity: '"Info"',
          updatedAt: '2021-05-20T12:06:26Z',
        },
      ],
    },
  },
};

export const getUnFitleredNotificationCountQuery = {
  request: {
    query: GET_NOTIFICATIONS_COUNT,
    variables: {
      filter: { severity: '' },
    },
  },
  result: {
    data: {
      countNotifications: 1,
    },
  },
};

export const getNotificationCountQuery = {
  request: {
    query: GET_NOTIFICATIONS_COUNT,
    variables: {
      filter: { is_read: false, severity: 'critical' },
    },
  },
  result: {
    data: {
      countNotifications: 1,
    },
  },
};

export const getCountWithEmptyFilter = {
  request: {
    query: GET_NOTIFICATIONS_COUNT,
    variables: {
      filter: {
        severity: 'Critical',
      },
    },
  },
  result: {
    data: {
      countNotifications: 1,
    },
  },
};

export const getCountWithFilter = {
  request: {
    query: GET_NOTIFICATIONS_COUNT,
    variables: {
      filter: {
        severity: 'Warning',
      },
    },
  },
  result: {
    data: {
      countNotifications: 1,
    },
  },
};

export const markAllNotificationAsRead = {
  request: {
    query: MARK_NOTIFICATIONS_AS_READ,
    variables: {},
  },
  result: {
    data: {
      markNotificationAsRead: true,
    },
  },
};
