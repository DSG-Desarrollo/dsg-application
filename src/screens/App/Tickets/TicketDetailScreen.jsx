import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native";
import Toolbar from "../../../components/atoms/Toolbar";
import { Ionicons } from "@expo/vector-icons";
import style from "../../../styles/TicketDetailScreenStyles";
import useFetchUnitWorkOrders from "../../../hooks/useFetchUnitWorkOrders";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import useMethodSaveToSQLite from "../../../hooks/useMethodSaveToSQLite";
import theme from '../../../themes/theme';

const TicketDetailScreen = ({ route, navigation }) => {
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
    progresoTarea,
    trabajo,
    servicio,
    colorTipoTarea,
    direccionTarea,
    requeridos,
    ordenRequerida,
    ordenCompletada,
    progresoTareaDescripcion,
    clienteId,
  } = route.params;
  const { unitsData, loading, error, refetch } =
    useFetchUnitWorkOrders(tareaId);
  const navigationRef = useRef();
  const titleWithCode = `Detalle Ticket - ${codigo}`;
  const handleBackPress = () => {
    navigation.goBack();
  };
  const handleItemClick = (
    id_orden_trabajo,
    id_servicio_cliente,
    id_unidad,
    numero_orden,
    progresoOrdenTrabajo
  ) => {
    navigation.navigate("TabNavigatorWorkOrder", {
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
      clienteId,
      id_orden_trabajo,
      id_servicio_cliente,
      id_unidad,
      numero_orden,
      progresoOrdenTrabajo,
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={style.orderItem}
      onPress={() =>
        handleItemClick(
          item.id_orden_trabajo,
          item.id_servicio_cliente,
          item.id_unidad,
          item.numero_orden,
          item.progreso_orden_trabajo
        )
      }
    >
      <View style={style.itemRow}>
        <Ionicons
          name={getIconForProgress(item.progreso_orden_trabajo)}
          size={24}
          color="#FFFFFF"
          style={style.icon}
        />
        <View style={style.textContainer}>
          <View style={style.textLine}>
            <Text
              style={[style.labelList, style.dynamicFontSize, style.textWhite]}
            >
              Matrícula:
            </Text>
            <Text
              style={[style.info, style.dynamicFontSize, style.textWhite]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.unidad}
            </Text>
          </View>
          <View style={style.textLine}>
            <Text
              style={[style.labelList, style.dynamicFontSize, style.textWhite]}
            >
              Marca:
            </Text>
            <Text
              style={[style.info, style.dynamicFontSize, style.textWhite]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.unidad_marca}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getIconForProgress = (progreso) => {
    switch (progreso) {
      case "O":
        return "alert-circle-sharp";
      case "I":
        return "warning";
      case "C":
        return "shield-checkmark-sharp";
      default:
        return "ios-help-circle";
    }
  };

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={style.section}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>GENERAL</Text>
          <Ionicons
            name="person"
            size={24}
            color={theme.colors.danger}
            style={style.icon}
          />
        </View>
        <View style={style.field}>
          <Text style={style.label}>Cliente: </Text>
          <Text style={style.value}>{empresa}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>Trabajo:</Text>
          <Text style={style.value}>{trabajo}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>Servicios:</Text>
          <Text style={style.value}>{servicio}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>Requeridos:</Text>
          <Text style={style.value}>{requeridos}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>Completado:</Text>
          <Text style={style.value}>{estado}</Text>
        </View>
      </View>

      <View style={style.section}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>PROGRAMACIÓN</Text>
          <Ionicons
            name="calendar"
            size={24}
            color={theme.colors.danger}
            style={style.icon}
          />
        </View>
        <View style={style.field}>
          <Text style={style.label}>Fecha:</Text>
          <Text style={style.value}>{fechaCreacion}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>Dirección:</Text>
          <Text style={style.value}>{direccionTarea}</Text>
        </View>
      </View>

      <View style={style.section}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>PROGRESO</Text>
          <Ionicons
            name="stats-chart"
            size={24}
            color={theme.colors.danger}
            style={style.icon}
          />
        </View>
        <View style={style.field}>
          <Text style={style.label}>Progreso:</Text>
          <Text style={style.value}>{progresoTareaDescripcion}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>Inicio:</Text>
          <Text style={style.value}>{fechaInicioTarea}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>Completado:</Text>
          <Text style={style.value}>{fechaFinTarea}</Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={style.ordersContainer}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>ORDENES</Text>
          <Ionicons
            name="list"
            size={24}
            color={theme.colors.danger}
            style={style.icon}
          />
        </View>
        {unitsData.length > 0 ? (
          unitsData.map((item) => {
            let backgroundColor;

            switch (item.progreso_orden_trabajo) {
              case "O":
                backgroundColor = theme.colors.danger; // Rojo para "O"
                break;
              case "I":
                backgroundColor = theme.colors.success; // Verde para "I"
                break;
              case "C":
                backgroundColor = theme.colors.primary; // Azul oscuro para "C"
                break;
              default:
                backgroundColor = theme.colors.surface; // Gris oscuro para otros casos
                break;
            }        

            return (
              <View
                key={item.id_unidad}
                style={[style.orderItem, { backgroundColor }]}
              >
                <View style={style.itemRow}>{renderItem({ item })}</View>
              </View>
            );
          })
        ) : (
          <Text style={style.noDataText}>No hay unidades que listar</Text>
        )}
      </View>
    </View>
  );

  // Manejar la acción de actualización
  const handleRefresh = () => {
    refetch(); // Llama al refetch para obtener los datos nuevamente
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Toolbar title={titleWithCode} onBackPress={handleBackPress} />
      <FlatList
        data={unitsData}
        keyExtractor={(item) => item.id_unidad.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshing={loading}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

export default TicketDetailScreen;
