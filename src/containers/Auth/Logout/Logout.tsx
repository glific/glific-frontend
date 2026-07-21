// eslint-disable-next-line
import { useApolloClient } from '@apollo/client';
import { CSSProperties, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { usePostHog } from '@posthog/react';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';
import { USER_SESSION } from 'config';
import { clearOrgEvalAccessCache } from 'containers/AIEvals/orgEvalAccessCache';
import { resetRolePermissions } from 'context/role';
import { clearAuthSession, clearUserSession, getAuthSession } from 'services/AuthService';
import { clearListSession } from 'services/ListService';
import { apiClient } from 'services/apiClient';

const divStyle: CSSProperties = {
  fontFamily: 'Heebo',
  fontStyle: 'normal',
  fontWeight: 'normal',
  fontSize: '16px',
  lineHeight: '20px',
  textAlign: 'center',
  color: '#073F24',
};

export const Logout = () => {
  const posthog = usePostHog();
  const client = useApolloClient();
  const { t } = useTranslation();
  const params = useParams();

  // let's notify the backend when user logs out
  const userLogout = () =>
    // best-effort: ask the backend to delete the session using the *current* token.
    // skipAuth so the interceptor doesn't renew a token just to immediately discard it
    // (and doesn't attempt a renew-and-retry if this call 401s during logout).
    apiClient.delete(USER_SESSION, {
      meta: { skipAuth: true },
      headers: { authorization: getAuthSession('access_token') },
    });

  // Wipe every trace of the session from local storage / caches. Safe to call more than once.
  const clearLocalSession = () => {
    clearAuthSession();
    clearUserSession();
    resetRolePermissions();
    clearListSession();
    clearOrgEvalAccessCache();
  };

  const handleLogout = async () => {
    posthog?.capture('user_logged_out');
    posthog?.reset();

    try {
      await userLogout();
    } catch {
      // continue local logout cleanup even when backend logout is unavailable
    }

    clearLocalSession();

    // clear apollo cache
    await client.clearStore();

    // Full page navigation so PostHog reinitialises on the login page and any
    // site-app banners are cleanly torn down without manual DOM cleanup.
    window.location.replace('/login');
  };

  useEffect(() => {
    if (params.mode === 'user') {
      // user clicked "Logout" — run the full flow (backend delete + cleanup + redirect)
      void handleLogout();
    } else {
      // forced logout (`/logout/session`): the token is already dead, so clear the stored session
      // NOW rather than waiting for the user to click "Login". Otherwise the app stays mounted
      // behind the dialog with a present-but-dead session and keeps firing /renew on every poll.
      clearLocalSession();
    }
  }, []);

  const dialog = (
    <DialogBox
      title={t('Your session has expired!')}
      buttonOk={t('Login')}
      handleOk={handleLogout}
      handleCancel={handleLogout}
      skipCancel
      alignButtons="center"
    >
      <div style={divStyle}>{t('Please login again to continue.')}</div>
    </DialogBox>
  );

  return dialog;
};

export default Logout;
