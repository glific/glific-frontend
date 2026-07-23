import axios from 'axios';
import { setErrorMessage } from 'common/notification';

import { VITE_GLIFIC_AUTHENTICATION_API } from 'config';

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
  | 'askGlificEnabled'
  | 'whatsappFormsEnabled'
  | 'aiEvaluationsEnabled'
  | 'copyNodeEnabled'
  | 'promptGeneratorEnabled'
  | 'supersetEnabled'
  | 'templateV2Enabled';

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
    case 'is_trial':
      returnValue = JSON.parse(session).is_trial;
      break;
    case 'trial_expiration_date':
      returnValue = JSON.parse(session).trial_expiration_date;
      break;
    default:
      returnValue = session;
  }
  return returnValue;
};

// NOTE: token renewal + the 30s-buffer validity check now live in `services/TokenManager`
// (getValidAccessToken / renewAccessToken / isAccessTokenValid), the single renewal authority
// consumed by apiClient (REST), the Apollo links (GraphQL), and the flow-editor shim.

// set authentication session
export const setAuthSession = (session: object) => {
  const existingSession = localStorage.getItem('glific_session');
  const existingData = existingSession ? JSON.parse(existingSession) : {};

  // Merge: Keep all existing fields, but allow new session to override them
  // This way we preserve trial fields even if they're not in subsequent calls
  const mergedSession = {
    ...existingData,
    ...session,
  };

  localStorage.setItem('glific_session', JSON.stringify(mergedSession));
};

// clear the authentication session
export const clearAuthSession = () => {
  localStorage.removeItem('glific_session');
};

// service to sent the OTP based on the phone number
export const sendOTP = (phoneNumber: string, registrationToken?: string, timeout?: number) => {
  const user: RegisterRequest = {
    phone: phoneNumber,
    registration: 'false',
  };

  if (registrationToken) {
    user.registration = 'true';
    user.token = registrationToken;
  }

  return axios
    .post(VITE_GLIFIC_AUTHENTICATION_API, { user }, timeout ? { timeout } : undefined)
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
