import React, { useContext } from 'react';
import { Redirect } from 'react-router';

import { SessionContext } from '../../../context/session';
import { clearAuthSession, clearUserSession } from '../../../services/AuthService';
import { setUserRole } from '../../../context/role';
import { useApolloClient } from '@apollo/client';

export interface LogoutProps {}

export const Logout: React.SFC<LogoutProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  const client = useApolloClient();

  // clear local storage auth session
  clearAuthSession();

  // update the context
  setAuthenticated(false);

  // clear local storage user session
  clearUserSession();

  // clear apollo cache
  client.resetStore();

  return <Redirect to="/login" />;
};
