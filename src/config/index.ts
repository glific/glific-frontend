const envVariables = import.meta.env;

const appName = envVariables.VITE_APPLICATION_NAME;

const API_PORT = envVariables.VITE_GLIFIC_API_PORT;
const BACKEND_URL = envVariables.VITE_GLIFIC_BACKEND_URL;
const PROTOCOL = window.location.protocol;
const API_PREFIX = envVariables.VITE_API_PREFIX;
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
export const VITE_GLIFIC_REGISTRATION_API = `${GLIFIC_API_URL}/v1/registration`;
export const VITE_GLIFIC_AUTHENTICATION_API = `${GLIFIC_API_URL}/v1/registration/send-otp`;
export const USER_SESSION = `${GLIFIC_API_URL}/v1/session`;
export const ORGANIZATION_NAME = `${GLIFIC_API_URL}/v1/session/name`;
export const RESET_PASSWORD = `${GLIFIC_API_URL}/v1/registration/reset-password`;
export const RENEW_TOKEN = `${USER_SESSION}/renew`;
export const FLOW_EDITOR_CONFIGURE_LINK = `${PROTOCOL}//${window.location.host}/flow/configure`;
export const CONTACT_CHAT_LINK = `${window.location.origin}/chat/`;
export const GUPSHUP_CALLBACK_URL = `${GLIFIC_BACKEND_URL}/gupshup`;
export const APPSIGNAL_API_KEY = envVariables.VITE_APPSIGNAL_API_KEY;
export const APP_NAME = appName || 'Glific: Two way communication platform';
export const LOGFLARE_API = envVariables.VITE_LOGFLARE_API_KEY;
export const LOGFLARE_SOURCE = envVariables.VITE_LOGFLARE_SOURCE_TOKEN;
export const GLIFIC_DOCS_URL = 'http://docs.glific.org';
export const CORS_PROXY_URL = 'https://cors-anywhere.tides.coloredcow.com';
export const FLOWS_HELP_LINK = 'https://app.rapidpro.io/video/';
export const STRIPE_PUBLISH_KEY = envVariables.VITE_STRIPE_PUBLISH_KEY;
export const ONBOARD_URL = `${GLIFIC_API_URL}/v1/onboard/setup`;
export const RECAPTCHA_CLIENT_KEY = envVariables.VITE_RECAPTCHA_CLIENT_KEY;
export const UPLOAD_CONTACTS_SAMPLE = 'https://storage.googleapis.com/cc-tides/sample_import.csv';
export const UPLOAD_CONTACTS_ADMIN_SAMPLE =
  'https://storage.googleapis.com/cc-tides/sample_import_admin.csv';
export const REGISTRATION_HELP_LINK =
  'https://glific.slab.com/public/posts/02-managing-staff-members-creating-account-on-glific-gg6fkw8h';
export const CONTACT_MANAGE_HELP_LINK =
  'https://glific.slab.com/public/posts/update-collection-with-bulk-contacts-or-contact-fields-yn8l1ggr';
export const SAMPLE_SHEET_LINK =
  'https://docs.google.com/spreadsheets/d/1fRpFyicqrUFxd79u_dGC8UOHEtAT3rA-G2i4tvOgScw';
export const BULK_APPLY_SAMPLE_LINK =
  'https://docs.google.com/spreadsheets/d/1x04wI9palh1Ag11TrdBbUj9pnyNOw8-I4834qN3idik';
