import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  TouchableOpacity,
  View,
  FlatList,
  Text,
  ActivityIndicator,
} from "react-native";
import Toolbar from "@components/atoms/Toolbar";
import { Ionicons } from "@expo/vector-icons";
import style from "@styles/TicketDetailScreenStyles";
import useFetchUnitWorkOrders from "@hooks/useFetchUnitWorkOrders";
import theme from '@themes/theme';
import { useIsFocused } from '@react-navigation/native';
import i18n from '@i18n/i18n';

const TicketDetailScreen = ({ route, navigation }) => {
  const isFocused = useIsFocused();
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
          <Text style={style.sectionTitle}>{i18n.t('workOrder:general')}</Text>
          <Ionicons
            name="person"
            size={24}
            color={theme.colors.danger}
            style={style.icon}
          />
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:client')} </Text>
          <Text style={style.value}>{empresa}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:work')}</Text>
          <Text style={style.value}>{trabajo}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:services')}</Text>
          <Text style={style.value}>{servicio}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:required')}</Text>
          <Text style={style.value}>{requeridos}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:status')}</Text>
          <Text style={style.value}>{estado}</Text>
        </View>
      </View>

      <View style={style.section}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>{i18n.t('workOrder:scheduling')}</Text>
          <Ionicons
            name="calendar"
            size={24}
            color={theme.colors.danger}
            style={style.icon}
          />
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:date')}:</Text>
          <Text style={style.value}>{fechaCreacion}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:address')}:</Text>
          <Text style={style.value}>{direccionTarea}</Text>
        </View>
      </View>

      <View style={style.section}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>{i18n.t('workOrder:progress')}</Text>
          <Ionicons
            name="stats-chart"
            size={24}
            color={theme.colors.danger}
            style={style.icon}
          />
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:progressValue')}:</Text>
          <Text style={style.value}>{progresoTareaDescripcion}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:start')}:</Text>
          <Text style={style.value}>{fechaInicioTarea}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:completed')}:</Text>
          <Text style={style.value}>{fechaFinTarea}</Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={style.ordersContainer}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>{i18n.t('workOrder:orders')}</Text>
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
          <Text style={style.noDataText}>{i18n.t('workOrder:noDataText')}</Text>
        )}
      </View>
    </View>
  );

  useEffect(() => {
    if (isFocused) {
      handleRefresh();
    }
  }, [isFocused]);

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
