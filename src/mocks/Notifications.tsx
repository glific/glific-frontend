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
          category: 'Partner',
          entity: '{"shortcode":"bigquery","id":2}',
          id: '1',
          isRead: true,
          message:
            'Disabling bigquery. Account does not have sufficient permissions to insert data to BigQuery.',
          severity: '"Critical"',
          updatedAt: '2024-03-23T15:26:41Z',
        },
        {
          category: 'Message',
          entity:
            '{"status":"valid","phone":"91987656789","name":"Adelle Cavin","last_message_at":"2021-03-23T17:05:01Z","is_hsm":null,"id":1,"group_id":null,"flow_id":1,"bsp_status":"hsm"}',
          id: '2',
          isRead: true,
          message: 'Cannot send session message to contact, invalid bsp status.',
          severity: '"Warning"',
          updatedAt: '2024-03-23T15:26:41Z',
        },
        {
          category: 'Flow',
          entity:
            '{"parent_id":6,"name":"Preference Workflow","flow_uuid":"12c25af0-37a2-4a69-8e26-9cfd98cab5c6","flow_id":3,"contact_id":3}',
          id: '3',
          isRead: true,
          message: 'Cannot send session message to contact, invalid bsp status.',
          severity: '"Warning"',
          updatedAt: '2024-03-23T15:26:41Z',
        },
        {
          category: 'Templates',
          entity: null,
          id: '4',
          isRead: true,
          message: 'Template Account balance has been approved',
          severity: '"Information"',
          updatedAt: '2024-03-23T15:26:41Z',
        },
        {
          category: 'Ticket',
          entity:
            '{"uuid":"98c7dec4-f05a-4a76-a25a-f7a50d821f27","shortcode":"otp","label":"OTP Message","id":9}',
          id: '5',
          isRead: true,
          message: 'Template OTP Message has been rejected',
          severity: '"Information"',
          updatedAt: '2024-03-23T15:26:41Z',
        },
        {
          category: 'WA Group',
          entity: '{"id":4,"body":"hi"}',
          id: '6',
          isRead: true,
          message: 'Error sending message: You dont own the phone[3446].',
          severity: '"Critical"',
          updatedAt: '2024-03-29T11:14:13Z',
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

export const getInfoNotificationsQuery = (filter: any = { severity: 'Info' }) => ({
  request: {
    query: FILTER_NOTIFICATIONS,
    variables: {
      filter,
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
});

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
