import React from 'react';
import { Image, StyleSheet } from 'react-native';

export default function Logo({ source, size, style }) {
  return (
    <Image
      source={source}
      style={[styles.image, { width: size, height: size }, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    marginBottom: 8,
  },
});
