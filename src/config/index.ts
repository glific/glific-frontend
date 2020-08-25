const envVariables = process.env;

export const URI = envVariables.REACT_APP_GLIFIC_API  ? envVariables.REACT_APP_GLIFIC_API : 'https://www.glificuat.coloredcow.com:8443/api' ;
export const SOCKET = envVariables && envVariables.REACT_APP_WEB_SOCKET ? envVariables.REACT_APP_WEB_SOCKET : 'wss://www.glificuat.coloredcow.com:8443/socket';
export const SENTRY_DSN = envVariables.SENTRY_DSN;
export const FLOW_EDITOR_API = envVariables && envVariables.REACT_APP_FLOW_EDITOR_API ? envVariables.REACT_APP_FLOW_EDITOR_API : 'https://www.glificuat.coloredcow.com:8443/flow-editor/';
