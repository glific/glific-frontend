const envVariables = process.env;

let appName = envVariables.REACT_APP_APPLICATION_NAME;

const API_PORT = envVariables.REACT_APP_GLIFIC_API_PORT;
const PROTOCOL = window.location.protocol;
const API_PREFIX = envVariables.REACT_APP_API_PREFIX;
const HOSTNAME = API_PREFIX
  ? `${API_PREFIX}.${window.location.hostname}`
  : window.location.hostname;

const GLIFIC_BACKEND_URL = API_PORT
  ? `${PROTOCOL}//${HOSTNAME}:${API_PORT}`
  : `${PROTOCOL}//${HOSTNAME}`;

const SOCKET_PROTOCOL = PROTOCOL === 'https:' ? `wss://${HOSTNAME}` : `ws://${HOSTNAME}`;

export const SOCKET = API_PORT
  ? `${SOCKET_PROTOCOL}:${API_PORT}/socket`
  : `${SOCKET_PROTOCOL}/socket`;
export const SENTRY_DSN = envVariables.SENTRY_DSN;
export const FLOW_EDITOR_API = GLIFIC_BACKEND_URL + '/flow-editor/';
export const GLIFIC_API_URL = GLIFIC_BACKEND_URL + '/api';
export const REACT_APP_GLIFIC_REGISTRATION_API = GLIFIC_API_URL + '/v1/registration';
export const REACT_APP_GLIFIC_AUTHENTICATION_API = GLIFIC_API_URL + '/v1/registration/send-otp';
export const USER_SESSION = GLIFIC_API_URL + '/v1/session';
export const RESET_PASSWORD = GLIFIC_API_URL + '/v1/registration/reset-password';
export const RENEW_TOKEN = USER_SESSION + '/renew';
export const FLOW_EDITOR_CONFIGURE_LINK = `${PROTOCOL}//${window.location.host}/automation/configure`;
export const GUPSHUP_CALLBACK_URL = GLIFIC_BACKEND_URL + '/gupshup';
export const APP_NAME = appName ? appName : 'Glific: Two way communication platform';


