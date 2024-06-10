import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const TabWorkOrderDetails = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Sección GENERAL */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>GENERAL</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.text}>Nombre del cliente</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Servicio:</Text>
            <Text style={styles.text}>Nombre del servicio</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trabajo:</Text>
            <Text style={styles.text}>Descripción del trabajo</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Requerido:</Text>
            <Text style={styles.text}>Cantidad requerida</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Completado:</Text>
            <Text style={styles.text}>Cantidad completada</Text>
          </View>
        </View>
      </View>

      {/* Sección PROGRAMACIÓN */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PROGRAMACIÓN</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.text}>Fecha del ticket</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Hora:</Text>
            <Text style={styles.text}>Hora del ticket</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.text}>Dirección del trabajo</Text>
          </View>
        </View>
      </View>

      {/* Sección PROCESO */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PROCESO</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Progreso:</Text>
            <Text style={styles.text}>Progreso del trabajo</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Inicio:</Text>
            <Text style={styles.text}>Fecha de inicio</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Completado:</Text>
            <Text style={styles.text}>Fecha de finalización</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F6F7FB',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontFamily: 'Roboto',
    fontSize: 15,
    backgroundColor: '#4CAF50',
    color: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: '#000',
    width: 80, // Ancho fijo para las etiquetas
  },
  text: {
    fontSize: 16,
    color: '#333',
    flex: 1, // El texto ocupa todo el espacio restante
  },
});

export default TabWorkOrderDetails;
