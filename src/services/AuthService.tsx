import axios from 'axios';

import { RENEW_TOKEN, REACT_APP_GLIFIC_AUTHENTICATION_API } from '../config/index';

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

// service to auto renew the auth token based on valid refresh token
export const renewAuthToken = () => {
  // get the renewal token from session
  axios.defaults.headers.common.Authorization = getAuthSession('renewal_token');

  return axios
    .post(RENEW_TOKEN)
    .then((response: any) => {
      return response;
    })
    .catch((error: any) => {
      // if we are not able to renew the token for some wierd reason or if refresh token
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
        registration,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      throw error;
    });
};

// set user object
export const setUserSession = (user: string) => {
  localStorage.setItem('glific_user', user);
};

// clear the user session
export const clearUserSession = () => {
  localStorage.removeItem('glific_user');
  localStorage.removeItem('role');
};

// get the current user session
export const getUserSession = (element?: string) => {
  const user = localStorage.getItem('glific_user');

  // let's early if there is no user session on local
  if (!user) return null;

  // let's return entire object if no element is sent
  if (!element) {
    return user;
  }

  // we should retun as requested
  let returnValue: any;
  switch (element) {
    case 'id':
      returnValue = JSON.parse(user).id;
      break;
    case 'organizationId':
      returnValue = JSON.parse(user).organization.id;
      break;
    case 'roles':
      returnValue = JSON.parse(user).roles;
      break;
    default:
      returnValue = JSON.parse(user);
  }
  return returnValue;
};
