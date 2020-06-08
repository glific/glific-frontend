const envVariables = process.env;
let uri: any;

switch (envVariables.NODE_ENV) {
  case 'development':
    uri = envVariables.REACT_APP_DEVELOPMENT_API;
    break;

  case 'production':
    uri = envVariables.REACT_APP_PRODUCTION_API;
    break;

  case 'test':
    break;

  default:
}

export const URI = uri;
