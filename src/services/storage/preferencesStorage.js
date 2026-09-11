// preferencesStorage.js
// Único responsable de leer/escribir en AsyncStorage las preferencias de
// idioma y tema (SPEC.md — Settings: idioma y tema, sección 7). Los
// componentes no deben conocer estas keys ni llamar a AsyncStorage
// directamente para estas preferencias.
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  LANGUAGE: '@dsg/settings/language',
  THEME: '@dsg/settings/theme',
};

export const SUPPORTED_LANGUAGES = ['en', 'es', 'es-LA'];
export const SUPPORTED_THEMES = ['system', 'light', 'dark'];

export const DEFAULT_THEME = 'system';

// Devuelve el idioma almacenado si es válido, o null si no hay preferencia
// guardada (o es inválida) para que el llamador decida el fallback.
export const getLanguage = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return SUPPORTED_LANGUAGES.includes(value) ? value : null;
  } catch (error) {
    console.error('Error al leer el idioma almacenado:', error);
    return null;
  }
};

export const setLanguage = async (language) => {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return;
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  } catch (error) {
    console.error('Error al guardar el idioma:', error);
  }
};

export const getTheme = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return SUPPORTED_THEMES.includes(value) ? value : DEFAULT_THEME;
  } catch (error) {
    console.error('Error al leer el tema almacenado:', error);
    return DEFAULT_THEME;
  }
};

export const setTheme = async (themePreference) => {
  if (!SUPPORTED_THEMES.includes(themePreference)) {
    return;
  }
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, themePreference);
  } catch (error) {
    console.error('Error al guardar el tema:', error);
  }
};

export const getPreferences = async () => {
  const [language, themePreference] = await Promise.all([getLanguage(), getTheme()]);
  return { language, theme: themePreference };
};

export default {
  getLanguage,
  setLanguage,
  getTheme,
  setTheme,
  getPreferences,
};
