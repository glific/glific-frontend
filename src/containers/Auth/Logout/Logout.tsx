import React, { useContext } from 'react';
import { Redirect } from 'react-router';

import { SessionContext } from '../../../context/session';
import { clearAuthSession, clearUserSession } from '../../../services/AuthService';
import { setUserRole } from '../../../context/role';

export interface LogoutProps {}

export const Logout: React.SFC<LogoutProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);

  // clear local storage auth session
  clearAuthSession();

  // update the context
  setAuthenticated(false);

  // clear local storage user session
  clearUserSession();

  // TODOS: We should clear apollo cache

  return <Redirect to="/login" />;
};
