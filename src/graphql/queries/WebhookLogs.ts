import { gql } from '@apollo/client';

export const FILTER_WEBHOOK_LOGS = gql`
  query webhookLogs($filter: WebhookLogFilter, $opts: Opts) {
    webhookLogs(filter: $filter, opts: $opts) {
      id
      url
      method
      requestHeaders
      requestJson
      statusCode
      responseJson
      error
      updatedAt
    }
  }
`;

export const GET_WEBHOOK_LOGS_COUNT = gql`
  query countWebhookLogs($filter: WebhookLogFilter) {
    countWebhookLogs(filter: $filter)
  }
`;
