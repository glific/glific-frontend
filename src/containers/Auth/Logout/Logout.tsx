import React, { useContext } from 'react';
import { Redirect } from 'react-router';
import { useApolloClient } from '@apollo/client';

import { resetRole } from '../../../context/role';
import { SessionContext } from '../../../context/session';
import { clearAuthSession, clearUserSession } from '../../../services/AuthService';

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

  // clear role & access permissions
  resetRole();
  
  // clear apollo cache
  client.resetStore();

  return <Redirect to="/login" />;
};
