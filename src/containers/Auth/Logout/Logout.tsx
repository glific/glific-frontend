import React, { useContext } from 'react';
import { Redirect } from 'react-router';
import { resetRole } from '../../../context/role';

import { SessionContext } from '../../../context/session';
import { clearAuthSession, clearUserSession } from '../../../services/AuthService';

export interface LogoutProps {}

export const Logout: React.SFC<LogoutProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);

  // clear local storage auth session
  clearAuthSession();

  // update the context
  setAuthenticated(false);

  // clear local storage user session
  clearUserSession();

  // clear role & access permissions
  resetRole();

  // TODOS: We should clear apollo cache

  return <Redirect to="/login" />;
};
