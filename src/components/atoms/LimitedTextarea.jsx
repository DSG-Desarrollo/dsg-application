import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput as Input } from 'react-native-paper';
import { theme } from '@core/theme';

/**
 * TextInput multilínea con contador de caracteres visible (ej. "120/500"), para que el
 * usuario sepa cuánto puede seguir escribiendo antes de llegar al límite. Mismo patrón
 * visual que el atom TextInput (paper, mode="outlined", description/error debajo).
 */
export default function LimitedTextarea({
  value = '',
  maxLength,
  numberOfLines = 4,
  errorText,
  description,
  style,
  ...props
}) {
  const length = value?.length || 0;
  const isNearLimit = maxLength ? length >= maxLength * 0.9 : false;

  return (
    <View style={styles.container}>
      <Input
        style={[styles.input, style]}
        selectionColor={theme.colors.primary}
        underlineColor="transparent"
        mode="outlined"
        multiline
        numberOfLines={numberOfLines}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          {errorText ? (
            <Text style={styles.error}>{errorText}</Text>
          ) : description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>
        {typeof maxLength === 'number' && (
          <Text style={[styles.counter, isNearLimit && styles.counterNearLimit]}>
            {length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
  },
  input: {
    backgroundColor: theme.colors.surface,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  footerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  description: {
    fontSize: 13,
    color: theme.colors.secondary,
  },
  error: {
    fontSize: 13,
    color: theme.colors.error,
  },
  counter: {
    fontSize: 12,
    color: theme.colors.secondary,
  },
  counterNearLimit: {
    color: theme.colors.error,
    fontWeight: '600',
  },
});
