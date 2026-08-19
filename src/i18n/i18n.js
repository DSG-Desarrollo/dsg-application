import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

// en
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enVehicles from './locales/en/workOrder.json';

// es
import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esVehicles from './locales/es/workOrder.json';

// es-LA
import esLACommon from './locales/es-LA/common.json';
import esLAAuth from './locales/es-LA/auth.json';
import esLAVehicles from './locales/es-LA/workOrder.json';
import esLARoutes from './locales/es-LA/routes.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    vehicles: enVehicles,
  },

  es: {
    common: esCommon,
    auth: esAuth,
    vehicles: esVehicles,
  },

  'es-LA': {
    common: esLACommon,
    auth: esLAAuth,
    vehicles: esLAVehicles,
    routes: esLARoutes,
  },
};

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