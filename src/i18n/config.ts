import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './en/translation.json';
import hiTranslation from './hi/translation.json';

export const resources = {
  en: {
    enTranslation,
  },
  hi: {
    hiTranslation,
  },
};

export default resources;

i18n.use(initReactI18next).init({
  lng: 'en',
  resources,
});
