import React, { useContext } from 'react';
import axios from 'axios';

import { SessionContext } from '../context/session';
import { RENEW_TOKEN } from '../common/constants';

export interface LogoutServiceProps {}

export const LogoutService: React.SFC<LogoutServiceProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);

  localStorage.removeItem('session');
  setAuthenticated(false);
  return null;
};

export const renewAuthToken = (renewToken: string) => {
  axios.defaults.headers.common['Authorization'] = renewToken;
  return axios
    .post(RENEW_TOKEN, {})
    .then((response: any) => {
      const responseString = JSON.stringify(response.data.data);
      //console.log('responseString', responseString);
      localStorage.setItem('session', responseString);
      return { renewStatus: true };
    })
    .catch((error: any) => {
      console.log('error', error);
    });
};

export const checkAuthStatusService = () => {
  let authStatus = false;
  const session = localStorage.getItem('session');
  if (!session) {
    authStatus = false;
  } else {
    const tokenExpiryTime = new Date(JSON.parse(session).token_expiry_time);
    //console.log('tokenExpiryTime', tokenExpiryTime);
    if (tokenExpiryTime > new Date()) {
      authStatus = true;
    } else {
      // this mean token has expired and we should try to auto renew it
      renewAuthToken(JSON.parse(session).renewal_token).then((response: any) => {
        //console.log('response', response);
        // let's set auth status to true if we are able to successfully renew the token
        if (response?.renewStatus) {
          authStatus = true;
        } else {
          // let's remove stale localstorage session
          //localStorage.removeItem('session');
          authStatus = false;
        }
      });
    }
  }
  // console.log('authStatus', authStatus);
  return authStatus;
};
