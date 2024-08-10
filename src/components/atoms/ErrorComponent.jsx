import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ErrorComponent = ({ message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>¡Error!</Text>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff0000',
  },
  messageText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default ErrorComponent;
