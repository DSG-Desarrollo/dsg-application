import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function ColorPickerButton() {
  return (
    <TouchableOpacity style={styles.button}>
      <Image source={require('../../assets/images/png-transparent-round-rgb-color-picker-thumbnail.png')} style={styles.icon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 10,
  },
  icon: {
    width: 50,
    height: 50,
  },
});
