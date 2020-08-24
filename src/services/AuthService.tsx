import React, { useContext } from 'react';
import { SessionContext } from '../context/session';

export interface LogoutServiceProps {}

export const LogoutService: React.SFC<LogoutServiceProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);

  localStorage.removeItem('session');
  setAuthenticated(false);
  return null;
};

export const checkAuthStatusService = () => {
  let authStatus = false;
  const session = localStorage.getItem('session');
  if (!session) {
    authStatus = false;
  } else {
    const tokenExpiryTime = new Date(JSON.parse(session).token_expiry_time);
    if (tokenExpiryTime > new Date()) {
      authStatus = true;
    } else {
      authStatus = false;
    }
  }

  return authStatus;
};
