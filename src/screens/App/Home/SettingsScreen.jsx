// SettingsScreen.jsx
// Pantalla de Settings: Apariencia (tema) e Idioma (SPEC.md — Settings:
// idioma y tema, sección 14). Solo UI + interacción del usuario: el estado
// de tema vive en ThemeContext y el de idioma en la instancia de i18next.
import React from 'react';
import { View, ScrollView } from 'react-native';
import { List, RadioButton, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@context/ThemeContext';
import { setLanguage, SUPPORTED_LANGUAGES } from '@services/storage/preferencesStorage';
import { createStyles } from './SettingsScreen.styles';

const THEME_OPTIONS = ['system', 'light', 'dark'];

const SettingsScreen = () => {
  const { t, i18n } = useTranslation('ui');
  const { theme, setTheme, colors } = useTheme();
  const styles = createStyles(colors);

  const themeLabels = {
    system: t('themeSystem'),
    light: t('themeLight'),
    dark: t('themeDark'),
  };

  const languageLabels = {
    en: t('english'),
    es: t('spanish'),
    'es-LA': t('spanishLatinAmerica'),
  };

  const handleThemeChange = (nextTheme) => {
    if (nextTheme !== theme) {
      setTheme(nextTheme);
    }
  };

  const handleLanguageChange = async (nextLanguage) => {
    if (nextLanguage === i18n.language) {
      return;
    }
    await i18n.changeLanguage(nextLanguage);
    await setLanguage(nextLanguage);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <List.Section>
        <List.Subheader style={styles.subheader}>{t('appearance')}</List.Subheader>
        <List.Item
          title={t('theme')}
          titleStyle={styles.itemTitle}
          style={styles.item}
        />
        <RadioButton.Group onValueChange={handleThemeChange} value={theme}>
          {THEME_OPTIONS.map((option) => (
            <RadioButton.Item
              key={option}
              label={themeLabels[option]}
              value={option}
              labelStyle={styles.optionLabel}
              color={colors.primary}
              style={styles.option}
            />
          ))}
        </RadioButton.Group>
      </List.Section>

      <Divider style={{ backgroundColor: colors.border }} />

      <List.Section>
        <List.Subheader style={styles.subheader}>{t('language')}</List.Subheader>
        <List.Item
          title={t('languageDescription')}
          titleStyle={styles.itemTitle}
          style={styles.item}
        />
        <RadioButton.Group onValueChange={handleLanguageChange} value={i18n.language}>
          {SUPPORTED_LANGUAGES.map((option) => (
            <RadioButton.Item
              key={option}
              label={languageLabels[option]}
              value={option}
              labelStyle={styles.optionLabel}
              color={colors.primary}
              style={styles.option}
            />
          ))}
        </RadioButton.Group>
      </List.Section>
    </ScrollView>
  );
};

export default SettingsScreen;
