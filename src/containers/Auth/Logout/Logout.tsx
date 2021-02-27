import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';

import { resetRole } from '../../../context/role';
import { SessionContext } from '../../../context/session';
import { clearAuthSession, clearUserSession, getAuthSession } from '../../../services/AuthService';
import { USER_SESSION } from '../../../config';
import { clearListSession } from '../../../services/ListService';
import { DialogBox } from '../../../components/UI/DialogBox/DialogBox';

export interface LogoutProps {
  match?: any;
}

export const Logout: React.SFC<LogoutProps> = (props: any) => {
  const { setAuthenticated } = useContext(SessionContext);
  const [redirect, setRedirect] = useState(false);
  const client = useApolloClient();

  // let's notify the backend when user logs out
  const userLogout = () => {
    // get the auth token from session
    axios.defaults.headers.common.Authorization = getAuthSession('access_token');
    axios.delete(USER_SESSION, {}).then(() => {});
  };

  const handleLogout = () => {
    userLogout();
    // clear local storage auth session
    clearAuthSession();

    // update the context
    setAuthenticated(false);

    // clear local storage user session
    clearUserSession();

    // clear role & access permissions
    resetRole();

    // clear local storage list sort session
    clearListSession();

    // clear apollo cache
    client.clearStore();

    setRedirect(true);
  };

  useEffect(() => {
    // if user click on logout menu
    if (props.match.params.user === 'true') {
      handleLogout();
      setRedirect(true);
    }
  }, []);

  const dialog = (
    <DialogBox
      title="Your session has expired!"
      buttonOk="Click to login"
      handleOk={() => handleLogout()}
      handleCancel={() => handleLogout()}
      skipCancel
      alignButtons="center"
    />
  );

  if (redirect) {
    return <Redirect to="/login" />;
  }

  return dialog;
};
