import axios from 'axios';

import { RENEW_TOKEN, REACT_APP_GLIFIC_AUTHENTICATION_API } from '../config/index';
import setLogs from '../config/logs';

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
  const renewalToken = getAuthSession('renewal_token');
  if (!renewalToken) {
    return new Error('Error');
  }
  // get the renewal token from session
  axios.defaults.headers.common.Authorization = renewalToken;

  return axios
    .post(RENEW_TOKEN)
    .then((response: any) => response)
    .catch((error: any) => {
      // add log's
      setLogs(`renewalToken:${renewalToken} URL:${RENEW_TOKEN}`, 'info');
      setLogs(error, 'error');
      // if we are not able to renew the token for some weird reason or if refresh token
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
export const sendOTP = (phoneNumber: string, registration = 'false') =>
  axios
    .post(REACT_APP_GLIFIC_AUTHENTICATION_API, {
      user: {
        phone: phoneNumber,
        registration,
      },
    })
    .then((response) => response)
    .catch((error) => {
      // add log's
      setLogs(
        `phoneNumber:${phoneNumber} registration:${registration} URL:${REACT_APP_GLIFIC_AUTHENTICATION_API}`,
        'info'
      );
      setLogs(error, 'error');
      throw error;
    });

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
    case 'language':
      returnValue = JSON.parse(user).language.locale;
      break;
    default:
      returnValue = JSON.parse(user);
  }
  return returnValue;
};

export const setAuthHeaders = () => {
  // // add authorization header in all calls
  let renewTokenCalled = false;
  let tokenRenewed = false;

  const { fetch } = window;
  window.fetch = (...args) =>
    (async (parameters) => {
      const parametersCopy = parameters;
      if (checkAuthStatusService()) {
        if (parametersCopy[1]) {
          parametersCopy[1].headers = {
            ...parametersCopy[1].headers,
            Authorization: getAuthSession('access_token'),
          };
        }
        const result = await fetch(...parametersCopy);
        return result;
      }
      renewTokenCalled = true;
      const authToken = await renewAuthToken();
      if (authToken.data) {
        // update localstore
        setAuthSession(JSON.stringify(authToken.data.data));
        renewTokenCalled = false;
        tokenRenewed = false;
      }
      if (parametersCopy[1]) {
        parametersCopy[1].headers = {
          ...parametersCopy[1].headers,
          Authorization: getAuthSession('access_token'),
        };
      }
      const result = await fetch(...parametersCopy);
      return result;
    })(args);

  const xmlSend = XMLHttpRequest.prototype.send;

  ((send) => {
    XMLHttpRequest.prototype.send = async function (body) {
      this.addEventListener('loadend', () => {
        if (this.status === 401) {
          window.location.href = '/logout/user';
        }
      });
      if (checkAuthStatusService()) {
        this.setRequestHeader('Authorization', getAuthSession('access_token'));
        send.call(this, body);
      } else if (renewTokenCalled && !tokenRenewed) {
        send.call(this, body);
        tokenRenewed = true;
      } else if (!renewTokenCalled) {
        renewTokenCalled = true;
        const authToken = await renewAuthToken();
        if (authToken.data) {
          // update localstore
          setAuthSession(JSON.stringify(authToken.data.data));
          renewTokenCalled = false;
          tokenRenewed = false;
        }
        this.setRequestHeader('Authorization', getAuthSession('access_token'));
        send.call(this, body);
      }
    };
  })(XMLHttpRequest.prototype.send);

  return { xmlSend, fetch };
};
