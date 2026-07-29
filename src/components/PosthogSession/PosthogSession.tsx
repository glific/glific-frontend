import { usePostHog } from '@posthog/react';
import { useEffect } from 'react';

import { getAuthSession } from 'services/AuthService';
import { setupPostHogFromStoredSession } from 'services/PostHogService';

/**
 * Associates returning authenticated sessions with the PostHog organization group.
 * Login flow sets the group explicitly; this covers page reloads and direct navigation.
 */
export function PosthogSession() {
  const posthog = usePostHog();

  useEffect(() => {
    if (!getAuthSession('access_token')) {
      return;
    }

    setupPostHogFromStoredSession(posthog);
  }, [posthog]);

  return null;
}
