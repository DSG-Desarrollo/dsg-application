import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput as Input } from 'react-native-paper';
import { useTheme } from '@context/ThemeContext';

export default function TextInput({ errorText, description, ...props }) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Input
        style={[styles.input, { backgroundColor: colors.surface }]}
        selectionColor={colors.primary}
        underlineColor="transparent"
        mode="outlined"
        {...props}
      />
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
  },
  input: {},
  description: {
    fontSize: 13,
    paddingTop: 8,
  },
  error: {
    fontSize: 13,
    paddingTop: 8,
  },
});
