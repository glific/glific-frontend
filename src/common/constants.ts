export const SIDE_DRAWER_WIDTH = 233;
export const DATE_FORMAT = 'DD/MM/YY';
export const TIME_FORMAT = 'HH:mm';
export const REACT_APP_GLIFIC_REGISTRATION_API =
  process.env.REACT_APP_GLIFIC_API + '/v1/registration';
export const REACT_APP_GLIFIC_AUTHENTICATION_API =
  process.env.REACT_APP_GLIFIC_API + '/v1/registration/send-otp';
export const USER_SESSION = process.env.REACT_APP_GLIFIC_API + '/v1/session';
export const RESET_PASSWORD = process.env.REACT_APP_GLIFIC_API + '/v1/registration/reset-password';
export const RENEW_TOKEN = USER_SESSION + '/renew';
export const FLOW_EDITOR_CONFIGURE_LINK = `${window.location.protocol}//${window.location.host}` + '/automation/configure';

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
