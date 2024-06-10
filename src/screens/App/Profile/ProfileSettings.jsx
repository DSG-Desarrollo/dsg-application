// SettingScreen.js

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Switch } from 'react-native-paper'; // Importa el componente Switch de react-native-paper
import { useTranslation } from 'react-i18next'; // Importa el hook useTranslation para cambiar el idioma
import { useTheme } from '../../../context/ThemeContext';

const SettingScreen = () => {
  const { t, i18n } = useTranslation(); // Hook para manejar traducciones
  const { isDarkMode, toggleDarkMode } = useTheme();
  const toggleLanguage = () => {
    // Función para cambiar el idioma entre inglés y español (ejemplo)
    const newLanguage = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  // Estado para manejar el modo de tema (oscuro o claro)
  //const [isDarkMode, setIsDarkMode] = React.useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.optionContainer} onPress={toggleLanguage}>
        <Text style={styles.optionText}>{t('Language')}</Text>
        <Text style={styles.optionText}>
          {i18n.language === 'en' ? 'English' : 'Español'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionContainer} onPress={toggleDarkMode}>
        <Text style={styles.optionText}>{i18n.t('theme')}</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dcdcdc',
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 18,
  },
});

export default SettingScreen;
