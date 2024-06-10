import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const Spinner = ({ size = 'large', color = '#0000ff', style }) => (
  <View style={[styles.container, style]}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Spinner;
