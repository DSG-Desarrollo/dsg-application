// TicketsOfDayScreen.js (Componente para la lista de tickets)
import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import TicketList from '../../../components/organisms/TicketList';
import CustomAlert from '../../../components/atoms/CustomAlert';
import CustomScrollView from '../../../components/atoms/CustomScrollView';
import useFetchTickets from '../../../hooks/useFetchTickets';

const TicketsOfDayScreen = () => {
  const { ticketsData, loading, error } = useFetchTickets();
  const [alertError, setAlertError] = React.useState(null); // Define el estado para el mensaje de error

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <CustomScrollView>
      <View style={styles.container}>
        {error && (
          <CustomAlert
            message={<Text>{error}</Text>}
            type="error"
            onClose={() => setAlertError(null)} // Utiliza setAlertError para limpiar el mensaje de error
          />
        )}
        {ticketsData.length > 0 ? (
          <View style={styles.ticketsContainer}>
            {ticketsData.map((task, index) => (
              //console.log(task.types_tasks.color_tipo_tarea),
              <TicketList
                key={index}
                tareaId={task.id_tarea}
                codigo={task.codigo_tarea}
                estado={task.estado_tarea}
                empresa={task.customer_service?.descripcion_servicio_cliente || ''}
                prioridad={task.priority?.prioridad_tarea || ''}
                fechaCreacion={task.registro_fecha}
                progresoTarea={task.progreso_tarea}
                idPrioridadTarea={task.id_prioridad_tarea}
                trabajo={task.types_tasks.tipo_tarea}
                servicio={task.types_tasks.service.servicio}
                colorTipoTarea={task.types_tasks.color_tipo_tarea}
                direccionTarea={task.direccion_tarea}
                requeridos={task.numero_solicitud}
              />
            ))}
          </View>
        ) : (
          <Text>No se encontraron tickets para mostrar.</Text>
        )}
      </View>
    </CustomScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  ticketsContainer: {
    flex: 1,
  },
});

export default TicketsOfDayScreen;
