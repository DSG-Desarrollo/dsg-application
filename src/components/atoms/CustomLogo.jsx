import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const CustomLogo = ({ source, width, height }) => {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={source}
        style={[styles.logo, { width: width, height: height }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  logo: {
    width: 150,
    height: 40,
    resizeMode: 'contain', // or 'stretch', 'center', 'cover' or 'repeat'
  },
});

export default CustomLogo;
