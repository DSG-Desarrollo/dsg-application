import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en';
import esTranslation from './locales/es';
import esLATranslation from './locales/es-LA';

const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  esLA: { translation: esLATranslation },
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'es', // Establecer aquí el idioma predeterminado
    fallbackLng: 'es',
    resources,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;