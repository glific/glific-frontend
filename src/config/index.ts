const envVariables: any = process.env;

const appName = envVariables.REACT_APP_APPLICATION_NAME;

const API_PORT = envVariables.REACT_APP_GLIFIC_API_PORT;
const PROTOCOL = window.location.protocol;
const API_PREFIX = envVariables.REACT_APP_API_PREFIX;
// added support for localhost, need to update it after backend fixes
const HOSTNAME =
  API_PREFIX && window.location.hostname !== 'localhost'
    ? `${API_PREFIX}.${window.location.hostname}`
    : window.location.hostname;

const GLIFIC_BACKEND_URL = API_PORT
  ? `${PROTOCOL}//${HOSTNAME}:${API_PORT}`
  : `${PROTOCOL}//${HOSTNAME}`;

const SOCKET_PROTOCOL = PROTOCOL === 'https:' ? `wss://${HOSTNAME}` : `ws://${HOSTNAME}`;

export const SOCKET = API_PORT
  ? `${SOCKET_PROTOCOL}:${API_PORT}/socket`
  : `${SOCKET_PROTOCOL}/socket`;
export const FLOW_EDITOR_API = `${GLIFIC_BACKEND_URL}/flow-editor/`;
export const GLIFIC_API_URL = `${GLIFIC_BACKEND_URL}/api`;
export const REACT_APP_GLIFIC_REGISTRATION_API = `${GLIFIC_API_URL}/v1/registration`;
export const REACT_APP_GLIFIC_AUTHENTICATION_API = `${GLIFIC_API_URL}/v1/registration/send-otp`;
export const USER_SESSION = `${GLIFIC_API_URL}/v1/session`;
export const RESET_PASSWORD = `${GLIFIC_API_URL}/v1/registration/reset-password`;
export const RENEW_TOKEN = `${USER_SESSION}/renew`;
export const FLOW_EDITOR_CONFIGURE_LINK = `${PROTOCOL}//${window.location.host}/flow/configure`;
export const GUPSHUP_CALLBACK_URL = `${GLIFIC_BACKEND_URL}/gupshup`;
export const APPSIGNAL_API_KEY = envVariables.REACT_APP_APPSIGNAL_API_KEY;
export const APP_NAME = appName || 'Glific: Two way communication platform';
export const LOGFLARE_API = envVariables.REACT_APP_LOGFLARE_API_KEY;
export const LOGFLARE_SOURCE = envVariables.REACT_APP_LOGFLARE_SOURCE_TOKEN;
export const GLIFIC_DOCS_URL = 'http://docs.glific.org';
export const CORS_PROXY_URL = 'https://cors-anywhere.tides.coloredcow.com';
export const FLOWS_HELP_LINK = 'https://app.rapidpro.io/video/';
export const STRIPE_PUBLISH_KEY = envVariables.REACT_APP_STRIPE_PUBLISH_KEY;
export const ONBOARD_URL = `${GLIFIC_API_URL}/v1/onboard/setup`;
export const RECAPTCHA_CLIENT_KEY = envVariables.REACT_APP_RECAPTCHA_CLIENT_KEY;
export const UPLOAD_CONTACTS_SAMPLE = 'https://storage.googleapis.com/cc-tides/sample_import.csv';
export const REGISTRATION_HELP_LINK =
  'https://glific.slab.com/public/posts/02-managing-staff-members-creating-account-on-glific-gg6fkw8h';
