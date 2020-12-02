import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';

import { resetRole } from '../../../context/role';
import { SessionContext } from '../../../context/session';
import { clearAuthSession, clearUserSession, getAuthSession } from '../../../services/AuthService';
import { USER_SESSION } from '../../../config';

export interface LogoutProps {}

export const Logout: React.SFC<LogoutProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const client = useApolloClient();

  // let's notify the backend when user logs out
  const userLogout = () => {
    // get the auth token from session
    axios.defaults.headers.common.Authorization = getAuthSession('access_token');
    axios.delete(USER_SESSION, {}).then(() => {});
  };

  useEffect(() => {
    userLogout();
    // clear local storage auth session
    clearAuthSession();

    // update the context
    setAuthenticated(false);

    // clear local storage user session
    clearUserSession();

    // clear role & access permissions
    resetRole();

    // clear apollo cache
    client.clearStore();
  }, []);

  return <Redirect to="/login" />;
};
