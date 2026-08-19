import React, { useState, useEffect } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import TicketList from "@components/organisms/TicketList";
import CustomAlert from "@components/atoms/CustomAlert";
import CustomScrollView from "@components/atoms/CustomScrollView";
import useNetworkState from "@hooks/useNetworkState";
import useFetchTickets from "@hooks/tickets/useFetchTickets";
import useSaveToSQLite from "@hooks/tickets/useSaveToSQLite";
import { useFocusEffect } from '@react-navigation/native';
import i18n from '@i18n/i18n';

const TicketsTab = ({ filters, checkNetwork }) => {
  useFocusEffect(
    React.useCallback(() => {
      console.log(`Tab with filters:`, filters);
    }, [filters])
  );
  const [alertError, setAlertError] = useState(null);
  const [dataToDisplay, setDataToDisplay] = useState([]);
  const [isResolvingDisplay, setIsResolvingDisplay] = useState(true);
  const { networkState } = useNetworkState();
  const { ticketsData, error, isLoading } = useFetchTickets(filters);
  const { isSaved, fetchAllSavedTickets } = useSaveToSQLite(ticketsData);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setIsResolvingDisplay(true);
      try {
        let result;
        if (networkState.isConnected) {
          if (ticketsData.length > 0) {
            await fetchAllSavedTickets();
            result = ticketsData.map(mapTicketData);
          } else {
            result = (await fetchAllSavedTickets()).map(mapTicketData);
          }
        } else if (checkNetwork) {
          result = (await fetchAllSavedTickets()).map(mapTicketData);
        } else {
          result = ticketsData.map(mapTicketData);
        }
        if (!cancelled) setDataToDisplay(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (!cancelled) setAlertError("Error al obtener los datos. Intenta de nuevo más tarde.");
      } finally {
        if (!cancelled) setIsResolvingDisplay(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [networkState.isConnected, ticketsData]);

  const mapTicketData = (task) => ({
    tareaId: task.id_tarea,
    codigo: task.codigo_tarea,
    estado: task.estado_tarea,
    empresa:
      task.customer_service?.descripcion_servicio_cliente ||
      task.descripcion_servicio_cliente ||
      "",
    prioridad: task.priority?.prioridad_tarea || task.prioridad_tarea || "",
    fechaInicioTarea: task.fecha_inicio_tarea || "",
    fechaCreacion: task.registro_fecha,
    fechaFinTarea: task.fecha_fin_tarea,
    progresoTarea: task.progreso_tarea,
    idPrioridadTarea: task.id_prioridad_tarea,
    trabajo: task.types_tasks?.tipo_tarea || task.tipo_tarea,
    servicio: task.types_tasks?.service?.servicio || task.servicio,
    colorTipoTarea: task.types_tasks?.color_tipo_tarea || task.id_tipo_tarea,
    direccionTarea: task.direccion_tarea,
    requeridos: task.numero_solicitud,
    ordenRequerida: task.orden_requerida,
    ordenCompletada: task.orden_completada,
    progresoTareaDescripcion: task.progreso_tarea_descripcion,
    clienteId: task.customer_service?.id_cliente || task.id_cliente,
  });

  return (
    <CustomScrollView>
      <View style={styles.container}>
        {alertError && (
          <CustomAlert
            message={<Text>{alertError}</Text>}
            type="error"
            onClose={() => setAlertError(null)}
          />
        )}
        {isLoading || isResolvingDisplay ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : dataToDisplay.length > 0 ? (
          <View style={styles.ticketsContainer}>
            {dataToDisplay.map((task, index) => (
              <TicketList key={index} {...task} />
            ))}
          </View>
        ) : (
          <Text>{i18n.t('ticket:noTickets')}</Text>
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

export default TicketsTab;
