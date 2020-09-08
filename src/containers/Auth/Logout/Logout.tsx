import React, { useContext } from 'react';

import { SessionContext } from '../../../context/session';

export interface LogoutProps {}

export const Logout: React.SFC<LogoutProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  localStorage.removeItem('glific_session');
  setAuthenticated(false);
  return null;
};
