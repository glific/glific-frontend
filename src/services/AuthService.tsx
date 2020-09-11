import axios from 'axios';

import { RENEW_TOKEN, REACT_APP_GLIFIC_AUTHENTICATION_API } from '../common/constants';

// service to auto renew the auth token based on valid refresh token
export const renewAuthToken = () => {
  // get the renewal token from session
  axios.defaults.headers.common['Authorization'] = getAuthSession('renewal_token');

  return axios
    .post(RENEW_TOKEN)
    .then((response: any) => {
      console.log('success with renewing');
      return response;
      // set the new session object
      // const responseString = JSON.stringify(response.data.data);
      // setAuthSession(responseString);
      // return { renewStatus: true };
    })
    .catch((error: any) => {
      // if we are not able to renew the token for some wierd reason or if refresh token
      console.log('error while renewing');
      throw error;
    });
};

// service to check the validity of the auth / token  status
export const checkAuthStatusService = () => {
  let authStatus = false;
  const tokenExpiryTimeFromSession = getAuthSession('token_expiry_time');
  // return false if there is no session on local
  if (!tokenExpiryTimeFromSession) {
    authStatus = false;
  } else {
    const tokenExpiryTime = new Date(tokenExpiryTimeFromSession);
    // compare the session token with the current time
    if (tokenExpiryTime > new Date()) {
      // token is still valid return true
      authStatus = true;
    } else {
      // this means token has expired and let's return false
      authStatus = false;
    }
  }
  return authStatus;
};

// set authentication session
export const setAuthSession = (session: string) => {
  localStorage.setItem('glific_session', session);
};

// get the current authentication session
export const getAuthSession = (element?: string) => {
  const session = localStorage.getItem('glific_session');

  // let's early if there is no session on local
  if (!session) return null;

  // we should retun as requested
  let returnValue: any;
  switch (element) {
    case 'token_expiry_time':
      returnValue = JSON.parse(session).token_expiry_time;
      break;
    case 'renewal_token':
      returnValue = JSON.parse(session).renewal_token;
      break;
    case 'access_token':
      returnValue = JSON.parse(session).access_token;
      break;
    default:
      returnValue = session;
  }
  return returnValue;
};

// clear the authentication session
export const clearAuthSession = () => {
  localStorage.removeItem('glific_session');
};

// service to sent the OTP based on the phone number
export const sendOTP = (phoneNumber: string, registration = 'false') => {
  return axios
    .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
      user: {
        phone: phoneNumber,
        registration: registration,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      throw error;
    });
};
