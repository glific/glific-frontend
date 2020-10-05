const envVariables = process.env;

const API_PORT = envVariables.REACT_APP_GLIFIC_API_PORT;
const PROTOCOL = window.location.protocol;
const HOSTNAME = window.location.hostname;
const API_PREFIX = envVariables.REACT_APP_API_PREFIX;
let GLIFIC_BACKEND_URL = API_PORT
  ? `${PROTOCOL}//${HOSTNAME}:${API_PORT}`
  : `${PROTOCOL}//${HOSTNAME}`;

GLIFIC_BACKEND_URL = API_PREFIX ? `${API_PREFIX}.${GLIFIC_BACKEND_URL}` : GLIFIC_BACKEND_URL;

export const SOCKET = API_PORT ? `ws://${HOSTNAME}:${API_PORT}/socket` : `ws://${HOSTNAME}/socket`;
export const SENTRY_DSN = envVariables.SENTRY_DSN;
export const FLOW_EDITOR_API = GLIFIC_BACKEND_URL + '/flow-editor/';
export const GLIFIC_API_URL = GLIFIC_BACKEND_URL + '/api';
export const REACT_APP_GLIFIC_REGISTRATION_API = GLIFIC_API_URL + '/v1/registration';
export const REACT_APP_GLIFIC_AUTHENTICATION_API = GLIFIC_API_URL + '/v1/registration/send-otp';
export const USER_SESSION = GLIFIC_API_URL + '/v1/session';
export const RESET_PASSWORD = GLIFIC_API_URL + '/v1/registration/reset-password';
export const RENEW_TOKEN = USER_SESSION + '/renew';
export const FLOW_EDITOR_CONFIGURE_LINK = `${PROTOCOL}//${window.location.host}/automation/configure`;
