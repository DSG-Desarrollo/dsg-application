import React, { useState, useEffect, useCallback } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import TicketList from "../../../components/organisms/TicketList";
import CustomAlert from "../../../components/atoms/CustomAlert";
import CustomScrollView from "../../../components/atoms/CustomScrollView";
import useNetworkState from "../../../hooks/useNetworkState";
import useFetchTickets from "../../../hooks/tickets/useFetchTickets";
import useSaveToSQLite from "../../../hooks/tickets/useSaveToSQLite";
import SearchFilter from "../../../components/molecules/SearchFilter";

const TicketsTab = ({ filters }) => {
  const [alertError, setAlertError] = useState(null);
  const [dataToDisplay, setDataToDisplay] = useState([]);
  const { networkState } = useNetworkState();
  const { ticketsData, error, isLoading } = useFetchTickets(filters);
  const { isSaved, fetchAllSavedTickets } = useSaveToSQLite(ticketsData);
  const [filteredData, setFilteredData] = useState([]);

  const handleFilterChange = (filters) => {
    // Lógica para filtrar datos basada en los filtros recibidos
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (networkState.isConnected) {
          // Obtener datos de la red y guardar en SQLite
          if (ticketsData.length > 0) {
            await fetchAllSavedTickets();
            setDataToDisplay(ticketsData.map(mapTicketData));
          } else {
            // Obtener datos guardados si no hay datos en ticketsData
            setDataToDisplay(await fetchAllSavedTickets().then(result => result.map(mapTicketData)));
          }
        } else {
          // Obtener datos guardados cuando no hay conexión
          setDataToDisplay(await fetchAllSavedTickets().then(result => result.map(mapTicketData)));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlertError("Error al obtener los datos. Intenta de nuevo más tarde.");
      }
    };

    fetchData();
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
      <SearchFilter onFilterChange={handleFilterChange} />
        {alertError && (
          <CustomAlert
            message={<Text>{alertError}</Text>}
            type="error"
            onClose={() => setAlertError(null)}
          />
        )}
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : dataToDisplay.length > 0 ? (
          <View style={styles.ticketsContainer}>
            {dataToDisplay.map((task, index) => (
              <TicketList key={index} {...task} />
            ))}
          </View>
        ) : (
          <Text>No hay tickets para mostrar</Text>
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
