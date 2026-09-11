// appTheme.js
// Tokens de color para modo claro/oscuro (Settings > Apariencia) y los themes
// derivados de ellos para React Navigation y React Native Paper, de forma que
// exista una única fuente de verdad de colores (SPEC.md — Settings: idioma y
// tema, secciones 13, 22 y 23).
import {
  DefaultTheme as NavigationLightTheme,
  DarkTheme as NavigationDarkTheme,
} from '@react-navigation/native';
import {
  DefaultTheme as PaperLightTheme,
  DarkTheme as PaperDarkTheme,
} from 'react-native-paper';
import { palette } from './colors';

export const lightColors = {
  background: palette.white,
  surface: palette.gray[50],
  text: palette.gray[900],
  textSecondary: palette.gray[600],
  border: palette.gray[200],
  primary: '#003F75',
  danger: palette.red[500],
};

export const darkColors = {
  background: '#121212',
  surface: '#1F1F1F',
  text: palette.white,
  textSecondary: palette.gray[400],
  border: palette.gray[700],
  primary: '#5B9BD8',
  danger: palette.red[500],
};

export const navigationLightTheme = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    card: lightColors.surface,
    text: lightColors.text,
    border: lightColors.border,
  },
};

export const navigationDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    card: darkColors.surface,
    text: darkColors.text,
    border: darkColors.border,
  },
};

export const paperLightTheme = {
  ...PaperLightTheme,
  colors: {
    ...PaperLightTheme.colors,
    primary: lightColors.primary,
    background: lightColors.background,
    surface: lightColors.surface,
    text: lightColors.text,
    error: lightColors.danger,
  },
};

export const paperDarkTheme = {
  ...PaperDarkTheme,
  colors: {
    ...PaperDarkTheme.colors,
    primary: darkColors.primary,
    background: darkColors.background,
    surface: darkColors.surface,
    text: darkColors.text,
    error: darkColors.danger,
  },
};
