import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import i18n from '@i18n/i18n';
import { unitDetail as styles } from './styles';

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
        <Text style={styles.sectionHeader}>{i18n.t('workOrder:headerGeneral')}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{i18n.t('workOrder:client')}:</Text>
            <Text style={styles.text}>{empresa}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{i18n.t('workOrder:service')}:</Text>
            <Text style={styles.text}>{servicio}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{i18n.t('workOrder:work')}:</Text>
            <Text style={styles.text}>{trabajo}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{i18n.t('workOrder:required')}:</Text>
            <Text style={styles.text}>{requeridos}</Text>
          </View>
        </View>
      </View>

      {/* Sección PROGRAMACIÓN */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>{i18n.t('workOrder:headerProgram')}:</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{i18n.t('workOrder:date')}:</Text>
            <Text style={styles.text}>{fechaCreacion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{i18n.t('workOrder:address')}:</Text>
            <Text style={styles.text}>{direccionTarea}</Text>
          </View>
        </View>
      </View>

      {/* Sección PROCESO */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>{i18n.t('workOrder:headerProcess')}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{i18n.t('workOrder:progressValue')}:</Text>
            <Text style={styles.text}>{progresoTareaDescripcion}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{i18n.t('workOrder:start')}:</Text>
            <Text style={styles.text}>{fechaInicioTarea}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{i18n.t('workOrder:completed')}:</Text>
            <Text style={styles.text}>{fechaFinTarea}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default TabWorkOrderDetails;
