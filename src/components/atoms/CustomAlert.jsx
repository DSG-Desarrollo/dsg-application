import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CustomAlert = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose && onClose(); // Llamar a la función onClose si está definida después de que la alerta se oculte
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    onClose && onClose();
  };

  return (
    visible && (
      <TouchableOpacity
        style={[styles.container, type === 'error' && styles.error, type === 'success' && styles.success]}
        onPress={handleClose}
      >
        <Text style={styles.message}>{message}</Text>
      </TouchableOpacity>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
  error: {
    backgroundColor: '#ffcccc',
    borderColor: '#ff9999',
  },
  success: {
    backgroundColor: '#ccffcc',
    borderColor: '#99ff99',
  },
});

export default CustomAlert;
