const envVariables = process.env;

export const URI = envVariables.REACT_APP_GLIFIC_API  ? envVariables.REACT_APP_GLIFIC_API : 'https://api.glificuat.coloredcow.com/api' ;
export const SOCKET = envVariables && envVariables.REACT_APP_WEB_SOCKET ? envVariables.REACT_APP_WEB_SOCKET : 'wss://api.glificuat.coloredcow.com/socket';
export const SENTRY_DSN = envVariables.SENTRY_DSN;
export const FLOW_EDITOR_API = envVariables && envVariables.REACT_APP_FLOW_EDITOR_API ? envVariables.REACT_APP_FLOW_EDITOR_API : 'https://api.glificuat.coloredcow.com/flow-editor/';
