import React, { useContext } from 'react';
import axios from 'axios';

import { SessionContext } from '../context/session';
import { RENEW_TOKEN, REACT_APP_GLIFIC_AUTHENTICATION_API } from '../common/constants';

export interface LogoutServiceProps {}

export const LogoutService: React.SFC<LogoutServiceProps> = () => {
  const { setAuthenticated } = useContext(SessionContext);
  localStorage.removeItem('glific_session');
  setAuthenticated(false);
  return null;
};

export const renewAuthToken = () => {
  const session = localStorage.getItem('glific_session');
  // if session object does not exist then just return false
  if (!session) {
    return new Promise((res) => {
      return { renewStatus: false };
    });
  }
  // get the renewal token from session
  axios.defaults.headers.common['Authorization'] = JSON.parse(session).renewal_token;

  return axios
    .post(RENEW_TOKEN, {})
    .then((response: any) => {
      // set the new session object
      const responseString = JSON.stringify(response.data.data);
      localStorage.setItem('glific_session', responseString);
      return { renewStatus: true };
    })
    .catch((error: any) => {
      console.log('Renewal Error', error);
      // if we are not able to renew the token for some wierd reason or if refresh token
      // is invalid then gracefully logout and it will send the user to login
      window.location.href = '/logout';
    });
};

export const checkAuthStatusService = () => {
  let authStatus = false;
  const session = localStorage.getItem('glific_session');
  if (!session) {
    authStatus = false;
  } else {
    const tokenExpiryTime = new Date(JSON.parse(session).token_expiry_time);
    if (tokenExpiryTime > new Date()) {
      authStatus = true;
    } else {
      // this mean token has expired and we should try to auto renew it
      renewAuthToken().then((response: any) => {
        // let's set auth status to true if we are able to successfully renew the token
        if (response?.renewStatus) {
          authStatus = true;
        } else {
          authStatus = false;
        }
      });
    }
  }
  return authStatus;
};

export const sendOTP = (phoneNumber: string) => {
  return axios
    .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
      user: {
        phone: phoneNumber,
        registration: 'false',
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      return error;
    });
};
