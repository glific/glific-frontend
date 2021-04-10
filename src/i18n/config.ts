import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en/en.json';
import hi from './hi/hi.json';

export const resources = {
  en: {
    translation: en,
  },
  hi: {
    translation: hi,
  },
};

export default resources;
console.log('initialized');
i18n.use(initReactI18next).init({
  lng: 'en',
  resources,
});
