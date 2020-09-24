const envVariables = process.env;

const API_PORT = envVariables.REACT_APP_GLIFIC_API_PORT;
const PROTOCOL = window.location.protocol;
const HOSTNAME = window.location.hostname;
const GLIFIC_BACKEND_URL = API_PORT ? `${PROTOCOL}//${HOSTNAME}:${API_PORT}` : `${PROTOCOL}//${HOSTNAME}`;

export const URI = `${GLIFIC_BACKEND_URL}/api`;
export const SOCKET = API_PORT ? `ws://${HOSTNAME}:${API_PORT}/socket` : `ws://${HOSTNAME}/socket`;
export const SENTRY_DSN = envVariables.SENTRY_DSN;
export const FLOW_EDITOR_API = GLIFIC_BACKEND_URL + '/flow-editor/';
