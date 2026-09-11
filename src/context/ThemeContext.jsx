// ThemeContext.jsx
// Fuente única de verdad para el tema de la app (SPEC.md — Settings: idioma y
// tema, secciones 10-12, 24). `theme` es la preferencia del usuario
// (system/light/dark); `resolvedTheme` es el tema efectivo que debe usar la
// UI (light/dark), resolviendo "system" contra useColorScheme().
import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  getTheme as getStoredTheme,
  setTheme as persistTheme,
} from '@services/storage/preferencesStorage';
import {
  lightColors,
  darkColors,
  paperLightTheme,
  paperDarkTheme,
  navigationLightTheme,
  navigationDarkTheme,
} from '@themes/appTheme';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState('system');
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadStoredTheme = async () => {
      const storedTheme = await getStoredTheme();
      if (isMounted) {
        setThemeState(storedTheme);
        setIsThemeLoaded(true);
      }
    };

    loadStoredTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  const setTheme = async (nextTheme) => {
    // Optimista: refleja el cambio en la UI de inmediato y persiste después.
    setThemeState(nextTheme);
    await persistTheme(nextTheme);
  };

  const resolvedTheme = theme === 'system'
    ? (systemScheme === 'dark' ? 'dark' : 'light')
    : theme;

  const value = useMemo(() => ({
    theme,
    resolvedTheme,
    isThemeLoaded,
    setTheme,
    colors: resolvedTheme === 'dark' ? darkColors : lightColors,
    paperTheme: resolvedTheme === 'dark' ? paperDarkTheme : paperLightTheme,
    navigationTheme: resolvedTheme === 'dark' ? navigationDarkTheme : navigationLightTheme,
  }), [theme, resolvedTheme, isThemeLoaded]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};
