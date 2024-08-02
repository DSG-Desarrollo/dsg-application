// TicketsOfDayScreen.js (Componente para la lista de tickets)
import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import TicketList from "../../../components/organisms/TicketList";
import CustomAlert from "../../../components/atoms/CustomAlert";
import CustomScrollView from "../../../components/atoms/CustomScrollView";
import useNetworkState from "../../../hooks/useNetworkState";
import useFetchTickets from "../../../hooks/tickets/useFetchTickets";
import useSaveToSQLite from '../../../hooks/tickets/useSaveToSQLite';
import { getUserDataFromStorage } from "../../../utils/storageUtils";

const TicketsOfDayScreen = () => {
  const { networkState } = useNetworkState();
  const filters = {
    id_puesto_empleado: 7,
  };
  const { ticketsData, error } = useFetchTickets(filters);
  const { isSaved, savedData } = useSaveToSQLite(ticketsData);
  const [alertError, setAlertError] = React.useState(null);
  const [dataToDisplay, setDataToDisplay] = useState([]);

  useEffect(() => {
    if (networkState.isConnected) {
      setDataToDisplay(ticketsData);
    } else {
      setDataToDisplay(savedData);
    }
  }, [ticketsData, savedData, networkState]);

  return (
    <CustomScrollView>
      <View style={styles.container}>
        {error && (
          <CustomAlert
            message={<Text>{error}</Text>}
            type="error"
            onClose={() => setAlertError(null)}
          />
        )}
        {ticketsData.length > 0 ? (
          <View style={styles.ticketsContainer}>
            {ticketsData.map((task, index) => (
              <TicketList
                key={index}
                tareaId={task.id_tarea}
                codigo={task.codigo_tarea}
                estado={task.estado_tarea}
                empresa={
                  task.customer_service?.descripcion_servicio_cliente || ""
                }
                prioridad={task.priority?.prioridad_tarea || ""}
                fechaInicioTarea={task.fecha_inicio_tarea || ""}
                fechaCreacion={task.registro_fecha}
                fechaFinTarea={task.fecha_fin_tarea}
                progresoTarea={task.progreso_tarea}
                idPrioridadTarea={task.id_prioridad_tarea}
                trabajo={task.types_tasks.tipo_tarea}
                servicio={task.types_tasks.service.servicio}
                colorTipoTarea={task.types_tasks.color_tipo_tarea}
                direccionTarea={task.direccion_tarea}
                requeridos={task.numero_solicitud}
                ordenRequerida={task.orden_requerida}
                ordenCompletada={task.orden_completada}
                progresoTareaDescripcion={task.progreso_tarea_descripcion}
                clienteId={task.customer_service.id_cliente}
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
    backgroundColor: "#fff",
  },
  ticketsContainer: {
    flex: 1,
  },
});

export default TicketsOfDayScreen;
