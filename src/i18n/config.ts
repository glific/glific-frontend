import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enUstranslation from './en_US/translation.json';
import hiIntranslation from './hi_IN/translation.json';

export const resources = {
  en_US: {
    enUstranslation,
  },
  hi_IN: {
    hiIntranslation,
  },
};

export default resources;

i18n.use(initReactI18next).init({
  lng: 'hi_IN',
  resources,
});
