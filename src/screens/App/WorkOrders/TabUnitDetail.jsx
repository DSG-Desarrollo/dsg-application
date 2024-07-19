import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const TabWorkOrderDetails = ({ route }) => {
  // Obtener los parámetros desde route.params
  const {
    tareaId,
    codigo,
    estado,
    empresa,
    prioridad,
    fechaInicioTarea,
    fechaCreacion,
    fechaFinTarea,
    tipo,
    trabajo,
    servicio,
    direccionTarea,
    requeridos,
    ordenRequerida,
    ordenCompletada,
    progresoTareaDescripcion,
    id_orden_trabajo,
    id_servicio_cliente,
    id_unidad,
  } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Sección GENERAL */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>GENERAL</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.text}>{empresa}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Servicio:</Text>
            <Text style={styles.text}>{servicio}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Trabajo:</Text>
            <Text style={styles.text}>{trabajo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Requerido:</Text>
            <Text style={styles.text}>{requeridos}</Text>
          </View>
        </View>
      </View>

      {/* Sección PROGRAMACIÓN */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PROGRAMACIÓN</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.text}>{fechaCreacion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección:</Text>
            <Text style={styles.text}>{direccionTarea}</Text>
          </View>
        </View>
      </View>

      {/* Sección PROCESO */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>PROCESO</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Progreso:</Text>
            <Text style={styles.text}>{progresoTareaDescripcion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Inicio:</Text>
            <Text style={styles.text}>{fechaInicioTarea}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Completado:</Text>
            <Text style={styles.text}>{fechaFinTarea}</Text>
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
    width: 90, // Ancho fijo para las etiquetas
  },
  text: {
    fontSize: 16,
    color: '#333',
    flex: 1, // El texto ocupa todo el espacio restante
  },
});

export default TabWorkOrderDetails;
