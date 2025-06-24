// eslint-disable-next-line
import { useContext, useEffect, CSSProperties } from 'react';
import axios from 'axios';
import { useLocation, useParams, useNavigate } from 'react-router';
import { useApolloClient } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import { resetRolePermissions } from 'context/role';
import { clearAuthSession, clearUserSession, getAuthSession } from 'services/AuthService';
import { USER_SESSION } from 'config';
import { clearListSession } from 'services/ListService';
import { DialogBox } from 'components/UI/DialogBox/DialogBox';

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
  const client = useApolloClient();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();

  // let's notify the backend when user logs out
  const userLogout = () => {
    // get the auth token from session
    axios.defaults.headers.common.authorization = getAuthSession('access_token');
    axios.delete(USER_SESSION);
  };

  const handleLogout = () => {
    userLogout();
    // clear local storage auth session
    clearAuthSession();

    // clear local storage user session
    clearUserSession();

    // clear role & access permissions
    resetRolePermissions();

    // clear local storage list sort session
    clearListSession();

    // clear apollo cache
    client.clearStore();

    navigate('/login', { replace: true, state: { to: location.state } });
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
      handleOk={() => handleLogout()}
      handleCancel={() => handleLogout()}
      skipCancel
      alignButtons="center"
    >
      <div style={divStyle}>{t('Please login again to continue.')}</div>
    </DialogBox>
  );

  return dialog;
};

export default Logout;
