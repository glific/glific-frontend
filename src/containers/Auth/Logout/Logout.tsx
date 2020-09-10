import React, { useContext } from 'react';

import { SessionContext } from '../../../context/session';
import { clearAuthSession } from '../../../services/AuthService';

export interface LogoutProps {}

export const Logout: React.SFC<LogoutProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  clearAuthSession();
  setAuthenticated(false);
  return null;
};
