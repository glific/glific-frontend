const envVariables: any = process.env;

const appName = envVariables.REACT_APP_APPLICATION_NAME;

const API_PORT = envVariables.REACT_APP_GLIFIC_API_PORT;
const BACKEND_URL = envVariables.REACT_APP_GLIFIC_BACKEND_URL;
const PROTOCOL = window.location.protocol;
const API_PREFIX = envVariables.REACT_APP_API_PREFIX;
const SOCKET_PROTOCOL = PROTOCOL === 'https:' ? 'wss' : 'ws';

// added support for localhost, need to update it after backend fixes
let HOSTNAME =
  API_PREFIX && window.location.hostname !== 'localhost'
    ? `${API_PREFIX}.${window.location.hostname}`
    : window.location.hostname;

let GLIFIC_BACKEND_URL = API_PORT
  ? `${PROTOCOL}//${HOSTNAME}:${API_PORT}`
  : `${PROTOCOL}//${HOSTNAME}`;

let SOCKET_URL = API_PORT
  ? `${SOCKET_PROTOCOL}://${HOSTNAME}:${API_PORT}/socket`
  : `${SOCKET_PROTOCOL}://${HOSTNAME}/socket`;

if (BACKEND_URL) {
  HOSTNAME = BACKEND_URL;
  GLIFIC_BACKEND_URL = `${PROTOCOL}//${HOSTNAME}`;
  SOCKET_URL = `${SOCKET_PROTOCOL}://${HOSTNAME}/socket`;
}

export const SOCKET = SOCKET_URL;
export const FLOW_EDITOR_API = `${GLIFIC_BACKEND_URL}/flow-editor/`;
export const GLIFIC_API_URL = `${GLIFIC_BACKEND_URL}/api`;
export const REACT_APP_GLIFIC_REGISTRATION_API = `${GLIFIC_API_URL}/v1/registration`;
export const REACT_APP_GLIFIC_AUTHENTICATION_API = `${GLIFIC_API_URL}/v1/registration/send-otp`;
export const USER_SESSION = `${GLIFIC_API_URL}/v1/session`;
export const RESET_PASSWORD = `${GLIFIC_API_URL}/v1/registration/reset-password`;
export const RENEW_TOKEN = `${USER_SESSION}/renew`;
export const FLOW_EDITOR_CONFIGURE_LINK = `${PROTOCOL}//${window.location.host}/flow/configure`;
export const CONTACT_CHAT_LINK = `${window.location.origin}/chat/`;
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
export const UPLOAD_CONTACTS_ADMIN_SAMPLE =
  'https://storage.googleapis.com/cc-tides/sample_import_admin.csv';
export const REGISTRATION_HELP_LINK =
  'https://glific.slab.com/public/posts/02-managing-staff-members-creating-account-on-glific-gg6fkw8h';
