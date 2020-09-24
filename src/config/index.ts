const envVariables = process.env;

const API_PORT = envVariables.REACT_APP_GLIFIC_API_PORT;
const API_PREFIX = envVariables.REACT_APP_GLIFIC_API_PREFIX;
const PROTOCOL = window.location.protocol;
const HOSTNAME = window.location.hostname;
const GLIFIC_API_URL = API_PORT ? `${PROTOCOL}//${HOSTNAME}:${API_PORT}/${API_PREFIX}` : `${PROTOCOL}//${HOSTNAME}/${API_PREFIX}`;

export const URI = GLIFIC_API_URL;
export const SOCKET = API_PORT ? `ws://${HOSTNAME}:${API_PORT}/socket` : `ws://${HOSTNAME}/socket`;
export const SENTRY_DSN = envVariables.SENTRY_DSN;
export const FLOW_EDITOR_API = GLIFIC_API_URL + '/flow-editor/';
