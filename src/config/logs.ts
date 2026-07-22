import { getUserSession } from 'services/AuthService';
import * as Sentry from '@sentry/react';

const toMessage = (value: any): string => {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const setLogs = (message: any, level: Sentry.SeverityLevel, asEvent: boolean = false) => {
  const orgId = getUserSession('organizationId');
  const userId = getUserSession('id');

  // Attach org/user as structured scope data instead of baking them into the
  // message text. Keeping them out of the message lets Sentry group events by
  // their real cause (one issue per cause, not one per user) while staying
  // filterable by user/org in the dashboard.
  const applyScope = (scope: Sentry.Scope) => {
    scope.setLevel(level);
    if (userId) scope.setUser({ id: String(userId) });
    if (orgId) scope.setTag('org_id', String(orgId));
  };

  if (!asEvent) {
    // Breadcrumbs are context for the next captured event — record the real level.
    Sentry.addBreadcrumb({ category: 'log', level, message: toMessage(message) });
    return;
  }

  Sentry.withScope((scope) => {
    applyScope(scope);
    if (message instanceof Error) {
      Sentry.captureException(message);
    } else {
      Sentry.captureMessage(toMessage(message), level);
    }
  });
};

export default setLogs;
