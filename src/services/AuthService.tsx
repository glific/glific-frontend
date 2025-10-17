import axios from 'axios';
import { setErrorMessage } from 'common/notification';

import { VITE_GLIFIC_AUTHENTICATION_API } from 'config';
import setLogs from 'config/logs';
import { tokenRenewalManager } from './TokenRenewalService';

interface RegisterRequest {
  phone: string;
  registration: string;
  token?: string;
}

type ServiceType =
  | 'dialogflow'
  | 'autoTranslationEnabled'
  | 'googleCloudStorage'
  | 'flowUuidDisplay'
  | 'rolesAndPermission'
  | 'contactProfileEnabled'
  | 'ticketingEnabled'
  | 'whatsappGroupEnabled'
  | 'certificateEnabled'
  | 'askMeBotEnabled';

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
    case 'last_login_time':
      returnValue = JSON.parse(session).last_login_time;
      break;
    default:
      returnValue = session;
  }
  return returnValue;
};

// service to auto renew the auth token based on valid refresh token
// delegates this to TokenRenewalManager to prevent race conditions
export const renewAuthToken = () => tokenRenewalManager.renewToken();

// service to check the validity of the auth / token  status
// uses a 30sec buffer to proactively renew tokens before they expire
// this prevents mid request token expirations
export const checkAuthStatusService = () => {
  let authStatus = false;
  const tokenExpiryTimeFromSession = getAuthSession('token_expiry_time');

  // return false if there is no session on local
  if (!tokenExpiryTimeFromSession) {
    authStatus = false;
  } else {
    const tokenExpiryTime = new Date(tokenExpiryTimeFromSession);
    const now = new Date();
    const bufferMs = 30 * 1000; // 30 seconds buffer

    // consider token invalid if it expires within the next 30 seconds
    // this ensures we renew tokens proactively before they actually expire
    if (tokenExpiryTime.getTime() - now.getTime() > bufferMs) {
      // token is still valid (with buffer) return true
      authStatus = true;
      setLogs(`Token valid. Expires in ${Math.floor((tokenExpiryTime.getTime() - now.getTime()) / 1000)}s`, 'info');
    } else {
      // this means token has expired or is about to expire
      authStatus = false;
      setLogs('Token expired or expiring soon (within 30s), renewal required', 'info');
    }
  }
  return authStatus;
};

// set authentication session
export const setAuthSession = (session: object) => {
  const lastLoginTime = getAuthSession('last_login_time');
  if (lastLoginTime) {
    const existingSession = { ...session, last_login_time: lastLoginTime };
    localStorage.setItem('glific_session', JSON.stringify(existingSession));
  } else {
    localStorage.setItem('glific_session', JSON.stringify(session));
  }
};

// clear the authentication session
export const clearAuthSession = () => {
  localStorage.removeItem('glific_session');
};

// service to sent the OTP based on the phone number
export const sendOTP = (phoneNumber: string, registrationToken?: string) => {
  const user: RegisterRequest = {
    phone: phoneNumber,
    registration: 'false',
  };

  if (registrationToken) {
    user.registration = 'true';
    user.token = registrationToken;
  }

  return axios
    .post(VITE_GLIFIC_AUTHENTICATION_API, {
      user,
    })
    .then((response) => response)
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
  localStorage.removeItem('organizationServices');
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
    case 'name':
      returnValue = JSON.parse(user).name;
      break;
    case 'organization':
      returnValue = JSON.parse(user).organization;
      break;
    default:
      returnValue = JSON.parse(user);
  }
  return returnValue;
};

export const setOrganizationServices = (services: string) => {
  localStorage.setItem('organizationServices', services);
};

export const getOrganizationServices = (service: ServiceType) => {
  let services: any = localStorage.getItem('organizationServices');
  if (!services) return null;
  services = JSON.parse(services);
  return services[service];
};

export const setAuthHeaders = () => {
  // add authorization header in all calls
  const { fetch } = window;
  window.fetch = (...args) =>
    (async (parameters) => {
      const parametersCopy = parameters;

      // check if token is valid (or renew if needed)
      if (!checkAuthStatusService()) {
        setLogs('Fetch: Token invalid, triggering renewal', 'info');
        await renewAuthToken();
      }

      if (parametersCopy[1]) {
        parametersCopy[1].headers = {
          ...parametersCopy[1].headers,
          authorization: getAuthSession('access_token'),
        };
      }

      // @ts-ignore
      const result = await fetch(...parametersCopy);
      return result;
    })(args);

  const xmlSend = XMLHttpRequest.prototype.send;
  const xmlOpen = XMLHttpRequest.prototype.open;

  ((open) => {
    // @ts-ignore
    XMLHttpRequest.prototype.open = function authOpen(
      method: string,
      url: string | URL,
      async: boolean,
      username?: string | null,
      password?: string | null
    ) {
      // mark renewal endpoint calls to prevent infinite loops
      if (url.toString().endsWith('renew')) {
        // @ts-ignore
        this.renewGlificCall = true;
      }
      open.call(this, method, url, async, username, password);
    };
  })(XMLHttpRequest.prototype.open);

  ((send) => {
    XMLHttpRequest.prototype.send = async function authCheck(body) {
      this.addEventListener('loadend', () => {
        // handle 401 errors by logging out
        // @ts-ignore
        if (!this.renewGlificCall && this.status === 401) {
          setLogs('XMLHttpRequest: Received 401, logging out', 'error');
          window.location.href = '/logout/user';
        }
      });

      // @ts-ignore
      if (this.renewGlificCall) {
        // this is the renewal endpoint itself - don't add auth or trigger renewal
        // to prevent infinite loops
        send.call(this, body);
      } else {
        // regular request - check token and renew if needed
        if (!checkAuthStatusService()) {
          setLogs('XMLHttpRequest: Token invalid, triggering renewal', 'info');
          await renewAuthToken();
        }

        this.setRequestHeader('authorization', getAuthSession('access_token'));
        send.call(this, body);
      }
    };
  })(XMLHttpRequest.prototype.send);

  return { xmlSend, fetch, xmlOpen };
};

export const checkOrgStatus = (status: any) => {
  if (status === 'suspended') {
    setErrorMessage(
      {
        message:
          'Your account is suspended or paused by your team. In case of any concerns, please reach out to us on support@glific.org.',
      },
      'Account Suspended'
    );
    return false;
  } else if (status === 'forced_suspension') {
    setErrorMessage(
      {
        message:
          'Your account has been suspended or paused due to a pending payment from your team. Kindly make the payment at your earliest convenience to resume your account. In case of any concerns, please reach out to us on support@glific.org.',
      },
      'Account Suspended'
    );
    return false;
  }

  return true;
};
