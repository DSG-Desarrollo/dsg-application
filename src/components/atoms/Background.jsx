import React from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { theme } from '../../core/theme';

export default function Background({ children }) {
  return (
    // `behavior="height"` en Android reduce la altura disponible cuando
    // aparece el teclado (a diferencia de dejar `undefined`, que en Expo Go
    // no la reduce en absoluto — confirmado en dispositivo real: los campos
    // de abajo quedaban tapados por el teclado sin que nada los empujara).
    // El <ScrollView> es lo que realmente resuelve el pedido de "centrar el
    // input enfocado": trae ese comportamiento incorporado en RN — cuando un
    // <TextInput> hijo recibe foco y el teclado aparece, el ScrollView se
    // desplaza automáticamente para dejarlo visible por encima del teclado.
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
