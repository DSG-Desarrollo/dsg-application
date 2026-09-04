import React, { useRef, useEffect, useState } from "react";
import {
  TouchableOpacity,
  View,
  FlatList,
  Text,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toolbar from "@components/atoms/Toolbar";
import { Ionicons } from "@expo/vector-icons";
import style from "@styles/TicketDetailScreenStyles";
import useFetchUnitWorkOrders from "@hooks/useFetchUnitWorkOrders";
import theme from '@themes/theme';
import { useIsFocused } from '@react-navigation/native';
import i18n from '@i18n/i18n';
import { faFileSignature } from "@fortawesome/free-solid-svg-icons";
import FabButton from "@components/atoms/FabButton";
import FullScreenModal from "@components/atoms/FullScreenModal";
import TabInstallationSignatureProof from "@screens/App/WorkOrders/TabInstallationSignatureProof";
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import workOrderService from "@services/api/workorder.service";

// OT no activas: canceladas ('A') o ya finalizadas ('C') en una firma anterior.
const INACTIVE_WORK_ORDER_STATUSES = ["A", "C"];

const { successDark } = theme.colors;

const TicketDetailScreen = ({ route, navigation }) => {
  const isFocused = useIsFocused();
  const [signatureModalVisible, setSignatureModalVisible] = useState(false);
  const [isSubmittingSignature, setIsSubmittingSignature] = useState(false);
  const [userData, setUserData] = useState(null);
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
  const titleWithCode = `${i18n.t('ticket:title')} - ${codigo}`;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("userData");
        setUserData(jsonValue ? JSON.parse(jsonValue) : null);
      } catch (e) {
        console.error("Error reading userData from storage", e);
      }
    };
    fetchUserData();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  // OT del ticket que aún requieren firma/finalización (no canceladas, no ya finalizadas).
  const getActiveWorkOrders = () =>
    unitsData.filter(
      (unit) => !INACTIVE_WORK_ORDER_STATUSES.includes(unit.progreso_orden_trabajo)
    );

  const handleOpenSignature = () => {
    if (getActiveWorkOrders().length === 0) {
      ToastAndroid.show(i18n.t('workOrder:signatureNoActiveOrders'), ToastAndroid.LONG);
      return;
    }
    setSignatureModalVisible(true);
  };

  // La firma es única por ticket: aplica a todas sus OT activas a la vez. Antes de
  // firmar, cada una de esas OT debe tener ya sus tabs (Instalación/Materiales/
  // Ubicación/Fotos) completos; si falta alguna, se bloquea el envío.
  const handleSignatureSubmit = async ({ nombre_firma_cliente, tipo_firma, image }) => {
    const activeWorkOrders = getActiveWorkOrders();

    if (activeWorkOrders.length === 0) {
      ToastAndroid.show(i18n.t('workOrder:signatureNoActiveOrders'), ToastAndroid.LONG);
      return;
    }

    const incompleteOrders = [];
    for (const workOrder of activeWorkOrders) {
      const { allCompleted } = await FormCompletionTracker.checkAllFormsCompleted(
        tareaId,
        workOrder.id_orden_trabajo
      );
      if (!allCompleted) {
        incompleteOrders.push(workOrder.numero_orden ?? workOrder.id_orden_trabajo);
      }
    }

    if (incompleteOrders.length > 0) {
      ToastAndroid.show(
        i18n.t('workOrder:signatureIncompleteOrders', { orders: incompleteOrders.join(', ') }),
        ToastAndroid.LONG
      );
      return;
    }

    setIsSubmittingSignature(true);

    try {
      const response = await workOrderService.saveTicketClientSignature(tareaId, {
        nombreFirmaCliente: nombre_firma_cliente,
        tipoFirma: tipo_firma,
        image,
        idUsuario: userData?.employee?.id_usuario_empleado,
        idCliente: clienteId,
      });

      if (response?.success) {
        ToastAndroid.show(i18n.t('workOrder:signatureSaveSuccess'), ToastAndroid.LONG);
        setSignatureModalVisible(false);
        refetch();
      } else {
        ToastAndroid.show(
          response?.error?.message || i18n.t('workOrder:signatureSaveError'),
          ToastAndroid.LONG
        );
      }
    } catch (error) {
      console.error("Error al guardar la firma del cliente:", error);
      ToastAndroid.show(i18n.t('workOrder:signatureSaveError'), ToastAndroid.LONG);
    } finally {
      setIsSubmittingSignature(false);
    }
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

  const renderHeader = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
      <View style={style.section}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>{i18n.t('workOrder:general')}</Text>
          <Ionicons
            name="person"
            size={24}
            color={theme.colors.brantSecondary}
            style={style.icon}
          />
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:client')}: </Text>
          <Text style={style.value}>{empresa}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:work')}: </Text>
          <Text style={style.value}>{trabajo}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:services')}</Text>
          <Text style={style.value}>{servicio}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:required')}: </Text>
          <Text style={style.value}>{requeridos}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:status')}: </Text>
          <Text style={style.value}>{estado}</Text>
        </View>
      </View>

      <View style={style.section}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>{i18n.t('workOrder:scheduling')}</Text>
          <Ionicons
            name="calendar"
            size={24}
            color={theme.colors.brantSecondary}
            style={style.icon}
          />
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:date')}: </Text>
          <Text style={style.value}>{fechaCreacion}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:address')}: </Text>
          <Text style={style.value}>{direccionTarea}</Text>
        </View>
      </View>

      <View style={style.section}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>{i18n.t('workOrder:progress')}</Text>
          <Ionicons
            name="stats-chart"
            size={24}
            color={theme.colors.brantSecondary}
            style={style.icon}
          />
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:progressValue')}:</Text>
          <Text style={style.value}>{progresoTareaDescripcion}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:start')}: </Text>
          <Text style={style.value}>{fechaInicioTarea}</Text>
        </View>
        <View style={style.field}>
          <Text style={style.label}>{i18n.t('workOrder:completed')}: </Text>
          <Text style={style.value}>{fechaFinTarea}</Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={style.ordersContainer}>
        <View style={style.sectionContent}>
          <Text style={style.sectionTitle}>{i18n.t('workOrder:orders')}</Text>
          <Ionicons
            name="list"
            size={24}
            color={theme.colors.brantSecondary}
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
              {i18n.t('ticket:plate')}:
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
              {i18n.t('ticket:brand')}:
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

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

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
      {/* Modal para firmar del cliente */}
      <FabButton
        icon={faFileSignature}
        iconColor="#FFFFFF"
        backgroundColor={successDark}
        onPress={handleOpenSignature}
      />
      <FullScreenModal
        visible={signatureModalVisible}
        onClose={() => setSignatureModalVisible(false)}
        title={i18n.t('workOrder:titleSignature')}
      >
        <TabInstallationSignatureProof
          onSubmit={handleSignatureSubmit}
          isSubmitting={isSubmittingSignature}
        />
      </FullScreenModal>
    </View>
  );
};

export default TicketDetailScreen;
