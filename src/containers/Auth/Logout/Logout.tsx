// eslint-disable-next-line
import { useApolloClient } from '@apollo/client';
import axios from 'axios';
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
  const userLogout = () => {
    // get the auth token from session
    axios.defaults.headers.common.authorization = getAuthSession('access_token');
    axios.delete(USER_SESSION);
  };

  const handleLogout = () => {
    posthog?.capture('user_logged_out');
    posthog?.reset();
    userLogout();
    // clear local storage auth session
    clearAuthSession();

    // clear local storage user session
    clearUserSession();

    // clear role & access permissions
    resetRolePermissions();

    // clear local storage list sort session
    clearListSession();

    // clear org eval request access cache
    clearOrgEvalAccessCache();

    // clear apollo cache
    client.clearStore();

    // Full page navigation so PostHog reinitialises on the login page and any
    // site-app banners are cleanly torn down without manual DOM cleanup.
    window.location.replace('/login');
  };

  useEffect(() => {
    // if user click on logout menu
    if (params.mode === 'user') {
      handleLogout();
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
