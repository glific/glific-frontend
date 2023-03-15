import { resources } from '../../i18n/config';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    resources: (typeof resources)['en'];
  }
}
