import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '@context/ThemeContext';

export default function Header({ style, ...props }) {
  const { colors } = useTheme();
  return <Text style={[styles.header, { color: colors.primary }, style]} {...props} />;
}

const styles = StyleSheet.create({
  header: {
    fontSize: 21,
    fontWeight: 'bold',
    paddingVertical: 12,
  },
});
