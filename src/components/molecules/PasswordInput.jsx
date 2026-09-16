import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { TextInput as Input } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome'; // Cambia 'FontAwesome' por el tipo de icono que desees
import { useTheme } from '@context/ThemeContext';

export default function PasswordInput({ errorText, description, ...props }) {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { colors } = useTheme();

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <View style={styles.container}>
      <Input
        style={[styles.input, { backgroundColor: colors.surface }]}
        selectionColor={colors.primary}
        underlineColor="transparent"
        mode="outlined"
        secureTextEntry={secureTextEntry}
        {...props}
      />
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={toggleSecureEntry}
      >
        <Icon
          name={secureTextEntry ? 'eye' : 'eye-slash'}
          size={26} // Ajusta el tamaño del ícono
          color={colors.primary}
        />
      </TouchableOpacity>
      {description && !errorText ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>
      ) : null}
      {errorText ? <Text style={[styles.error, { color: colors.danger }]}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
    position: 'relative',
  },
  input: {
    paddingRight: 40, // Ajusta el espacio para el ícono del ojo
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    right: 0, // Coloca el ícono en el lado derecho del input
    padding: 10, // Aumenta el área de clic del ícono
  },
  description: {
    fontSize: 13,
    paddingTop: 8,
  },
  error: {
    fontSize: 13,
    paddingTop: 8,
  },
});
