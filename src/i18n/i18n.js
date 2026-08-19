import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

import resources from './locales';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'es-LA',
    fallbackLng: 'es-LA',
    resources,
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'workOrder',
    ],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;