import { getUserSession } from 'services/AuthService';
import * as Sentry from '@sentry/react';

const setLogs = (message: any, type: Sentry.SeverityLevel, event: boolean = false) => {
  const orgId = getUserSession('organizationId');
  const userId = getUserSession('id');

  let logMessage;
  if (typeof message === 'object') {
    message = JSON.stringify(message);
  }

  logMessage = `org_id: ${orgId} user_id: ${userId} [${type}] ${message}`;

  if (event) {
    Sentry.captureMessage(logMessage, type);
  } else {
    Sentry.addBreadcrumb({
      category: 'info',
      level: 'info',
      message: logMessage,
    });
  }
};

export default setLogs;
