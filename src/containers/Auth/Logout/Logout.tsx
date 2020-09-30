import React, { useContext } from 'react';
import { Redirect } from 'react-router';

import { SessionContext } from '../../../context/session';
import { clearAuthSession } from '../../../services/AuthService';
import { setUserRole } from '../../../context/role';

export interface LogoutProps {}

export const Logout: React.SFC<LogoutProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  clearAuthSession();
  setAuthenticated(false);
  // reset user role
  setUserRole([]);
  return <Redirect to="/login" />;
};
