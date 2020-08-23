import React, { useContext } from 'react';
import { SessionContext } from '../context/session';

export interface LogoutServiceProps {}

export const LogoutService: React.SFC<LogoutServiceProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);

  localStorage.removeItem('session');
  setAuthenticated(false);
  return null;
};
