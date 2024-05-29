import axios from 'axios';
import { setErrorMessage } from 'common/notification';

import { RENEW_TOKEN, VITE_GLIFIC_AUTHENTICATION_API } from 'config';
import setLogs from 'config/logs';

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
  | 'llm4devEnabled';

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
export const renewAuthToken = () => {
  const renewalToken = getAuthSession('renewal_token');
  if (!renewalToken) {
    return new Error('Error');
  }
  // get the renewal token from session
  axios.defaults.headers.common.authorization = renewalToken;

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
      // add log's
      setLogs(
        `phoneNumber:${phoneNumber} registration:${user.registration} URL:${VITE_GLIFIC_AUTHENTICATION_API}`,
        'info'
      );
      setLogs(error, 'error');
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
  let renewTokenCalled = false;
  let renewCallInProgress = false;

  const { fetch } = window;
  window.fetch = (...args) =>
    (async (parameters) => {
      const parametersCopy = parameters;
      if (checkAuthStatusService()) {
        if (parametersCopy[1]) {
          parametersCopy[1].headers = {
            ...parametersCopy[1].headers,
            authorization: getAuthSession('access_token'),
          };
        }
        // @ts-ignore
        const result = await fetch(...parametersCopy);
        return result;
      }
      renewTokenCalled = true;
      const authToken = await renewAuthToken();
      if (authToken.data) {
        // update localstore
        setAuthSession(authToken.data.data);
        renewTokenCalled = false;
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
        // @ts-ignore
        if (this.renewGlificCall) {
          renewCallInProgress = false;
        } else if (this.status === 401) {
          window.location.href = '/logout/user';
        }
      });

      // @ts-ignore
      if (this.renewGlificCall && !renewCallInProgress) {
        renewCallInProgress = true;
        send.call(this, body);
      }
      // @ts-ignore
      else if (this.renewGlificCall) {
        this.abort();
      }
      // @ts-ignore
      else if (checkAuthStatusService()) {
        this.setRequestHeader('authorization', getAuthSession('access_token'));
        send.call(this, body);
      } else if (!renewTokenCalled) {
        renewTokenCalled = true;
        const authToken = await renewAuthToken();
        if (authToken.data) {
          // update localstore
          setAuthSession(authToken.data.data);
          renewTokenCalled = false;
        }
        this.setRequestHeader('authorization', getAuthSession('access_token'));
        send.call(this, body);
      }
    };
  })(XMLHttpRequest.prototype.send);

  return { xmlSend, fetch, xmlOpen };
};

export const checkOrgStatus = (status: any) => {
  if (status) {
    setErrorMessage(
      {
        message:
          'Your account is suspended/ paused by your team. In case of any concerns/ queries, please reach out to us on sangeeta@glific.org.',
      },
      'Account Suspended'
    );
    return false;
  } else if (status === 'FORCED_SUSPENSION') {
    setErrorMessage(
      {
        message:
          "Your account is suspended/paused as payment isn't done by your team. Please make the payment as soon as possible to resume using the account. In case of any concerns/ queries, please reach out to us on sangeeta@glific.org.",
      },
      'Account Suspended'
    );
    return false;
  }

  return true;
};
