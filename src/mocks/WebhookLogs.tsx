import { FILTER_WEBHOOK_LOGS, GET_WEBHOOK_LOGS_COUNT } from 'graphql/queries/WebhookLogs';

export const getWebhookLogsQuery = {
  request: {
    query: FILTER_WEBHOOK_LOGS,
    variables: {
      filter: {},
      opts: { limit: 50, offset: 0, order: 'DESC', orderWith: 'updated_at' },
    },
  },
  result: {
    data: {
      webhookLogs: [
        {
          id: '1',
          url: 'glific.com',
          method: 'GET',
          status: 'Success',
          requestHeaders: '',
          requestJson: '',
          statusCode: 200,
          responseJson: '',
          error: null,
          updatedAt: null,
        },
      ],
    },
  },
};

export const getWebhookLogsCountQuery = {
  request: {
    query: GET_WEBHOOK_LOGS_COUNT,
    variables: {
      filter: {},
    },
  },
  result: {
    data: {
      countWebhookLogs: 1,
    },
  },
};
