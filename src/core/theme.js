import { DefaultTheme, DarkTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: '#000000',
    primary: '#003F75', // Color base para el tema claro
    secondary: '#414757',
    error: '#f13a59',
  },
};

export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#BB86FC',
    accent: '#03dac4',
    background: '#121212',
    surface: '#121212',
    // Otros colores oscuros que desees definir para el tema oscuro
  },
};
