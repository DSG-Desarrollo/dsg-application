// ThemeProvider.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    retrieveThemePreference();
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    await AsyncStorage.setItem('themePreference', JSON.stringify(newMode));
  };

  const retrieveThemePreference = async () => {
    try {
      const themePreference = await AsyncStorage.getItem('themePreference');
      if (themePreference !== null) {
        setIsDarkMode(JSON.parse(themePreference));
      }
    } catch (error) {
      console.error('Error retrieving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : defaultTheme; // Escoge el tema según el modo

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
