import React, { useContext } from 'react';
import { Redirect } from 'react-router-dom';

import { SessionContext } from '../../../context/session';
import { setUserRole } from '../../../context/role';
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

  // reset user role
  setUserRole([]);

  // TODOS: We should clear apollo cache

  return <Redirect to="/login" />;
};
