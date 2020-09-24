export const SIDE_DRAWER_WIDTH = 233;
export const DATE_FORMAT = 'DD/MM/YY';
export const TIME_FORMAT = 'HH:mm';

const API_PORT = process.env.REACT_APP_GLIFIC_API_PORT;
const PROTOCOL = window.location.protocol;
const HOSTNAME = window.location.hostname;

export const GLIFIC_API_URL = API_PORT ? `${PROTOCOL}//${HOSTNAME}:${API_PORT}/api` : `${PROTOCOL}//${HOSTNAME}/api`;
export const REACT_APP_GLIFIC_REGISTRATION_API = GLIFIC_API_URL + '/v1/registration';
export const REACT_APP_GLIFIC_AUTHENTICATION_API = GLIFIC_API_URL + '/v1/registration/send-otp';
export const USER_SESSION = GLIFIC_API_URL + '/v1/session';
console.log(USER_SESSION);
export const RESET_PASSWORD = GLIFIC_API_URL + '/v1/registration/reset-password';
export const RENEW_TOKEN = USER_SESSION + '/renew';
export const FLOW_EDITOR_CONFIGURE_LINK = `${window.location.protocol}//${window.location.host}/automation/configure`;

// const enums
// provider status against the contact
export const PROVIDER_STATUS = [
  { id: 'NONE', label: 'Cannot send messages' },
  { id: 'HSM', label: 'Can send template messages' },
  { id: 'SESSION', label: 'Can send speed sends' },
  { id: 'SESSION_AND_HSM', label: 'Can send template messages and speed sends' },
];

// status against the contact
export const CONTACT_STATUS = [
  { id: 'VALID', label: 'Valid contact' },
  { id: 'INVALID', label: 'Invalid contact' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'FAILED', label: 'Failed' },
];

export const SEARCH_QUERY_VARIABLES = {
  contactOpts: {
    limit: 50,
  },
  filter: {},
  messageOpts: {
    limit: 50,
  },
};
