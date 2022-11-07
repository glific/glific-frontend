import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en/en.json';
import hi from './hi/hi.json';

export const defaultNS = 'en';

const resources = {
  en: {
    translation: en,
  },
  hi: {
    translation: hi,
  },
};

i18next.use(LanguageDetector).use(initReactI18next).init({
  resources,
  defaultNS,
  fallbackLng: 'en',
});
