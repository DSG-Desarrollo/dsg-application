import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCircleInfo,
  faTools,
  faClipboardCheck,
  faWrench,
  faPhotoFilm
} from "@fortawesome/free-solid-svg-icons";
import { Text, View, ToastAndroid } from "react-native";
import {
  TabUnitDetail,
  TabInstallationType,
  TabWorkOrderSupplies,
  TabEquipmentLocation,
  TabWorkOrderPhotos,
} from "@screens/App/WorkOrders/";
import Toolbar from "@components/atoms/Toolbar";
import { useNavigation } from "@react-navigation/native";
import theme from "@themes/theme";
import i18n from "@i18n/i18n";
import { WorkOrderFormCompletionProvider } from "@context/WorkOrderFormCompletionContext";

const Tab = createMaterialTopTabNavigator();

// Tabs (formularios) que deben completarse para dar por finalizada la OT. No incluye
// "TabUnitDetail" (solo informativo, no es un formulario que se guarde).
const REQUIRED_FORM_KEYS = [
  "form_installation_type",
  "form_work_order_supplies",
  "form_equipment_location",
  "form_work_order_photos",
];

const TabNavigatorWorkOrder = ({ route }) => {
  const navigation = useNavigation(); // Accede al objeto de navegación
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
    clienteId,
    id_orden_trabajo,
    id_servicio_cliente,
    id_unidad,
    numero_orden,
    progresoOrdenTrabajo,
  } = route.params;
  const [completedForms, setCompletedForms] = useState([]);
  // Evita mostrar el toast/redirigir más de una vez por visita a esta OT (p.ej. si el
  // usuario vuelve a guardar un tab ya completo después de haber completado todos).
  const hasHandledFullCompletionRef = useRef(false);

  // Función para verificar qué formularios han sido completados. Cuando `notifyIfComplete`
  // es true (se llama como reacción a que un tab acaba de guardar exitosamente), y con
  // ese guardado quedan TODOS los formularios de la OT completos -sin importar el orden
  // en que se hayan ido completando-, se muestra el toast de éxito y se regresa al
  // detalle del ticket (donde está el listado de unidades). Si algún tab termina con
  // error, nunca llega a llamar a este callback, así que jamás se dispara el redirect.
  const checkCompletedForms = async (notifyIfComplete = false) => {
    try {
      const taskIdStr = tareaId.toString();
      const workOrderIdStr = id_orden_trabajo.toString();

      const ticketData =
        JSON.parse(await AsyncStorage.getItem(taskIdStr)) || {};
      const workOrderData = ticketData[workOrderIdStr] || {};

      const completed = Object.keys(workOrderData).filter(
        (formKey) => workOrderData[formKey].status === "completed"
      );

      setCompletedForms(completed);

      const allRequiredCompleted = REQUIRED_FORM_KEYS.every((key) =>
        completed.includes(key)
      );

      if (
        notifyIfComplete &&
        allRequiredCompleted &&
        !hasHandledFullCompletionRef.current
      ) {
        hasHandledFullCompletionRef.current = true;
        ToastAndroid.show(
          i18n.t('workOrder:workOrderAllTabsCompletedToast'),
          ToastAndroid.LONG
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error al verificar los formularios completados: ", error);
    }
  };

  useEffect(() => {
    checkCompletedForms();
  }, []);

  const sharedParams = {
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
  };

  const renderTabBarLabel = ({ route, color }) => {
    let labelName;
    let tabKey;

    if (route.name === "TabUnitDetail") {
      labelName = "Unidad";
    } else if (route.name === "TabInstallationType") {
      labelName = "Instalación";
      tabKey = "form_installation_type";
    } else if (route.name === "TabWorkOrderSupplies") {
      labelName = "Materiales";
      tabKey = "form_work_order_supplies";
    } else if (route.name === "TabEquipmentLocation") {
      labelName = "Ubicación";
      tabKey = "form_equipment_location";
    } else if (route.name === "TabWorkOrderPhotos") {
      labelName = "Fotos";
      tabKey = "form_work_order_photos";
    }

    const isCompleted = completedForms.includes(tabKey);

    return (
      <Text style={{ color: isCompleted ? "green" : color }}>{labelName}</Text>
    );
  };

  const renderTabBarIcon = ({ route, color }) => {
    let iconName;
    let tabKey;
  
    if (route.name === "TabUnitDetail") {
      iconName = faCircleInfo;
    } else if (route.name === "TabInstallationType") {
      iconName = faTools;
      tabKey = "form_installation_type";
    } else if (route.name === "TabWorkOrderSupplies") {
      iconName = faClipboardCheck;
      tabKey = "form_work_order_supplies";
    } else if (route.name === "TabEquipmentLocation") {
      iconName = faWrench;
      tabKey = "form_equipment_location";
    } else if (route.name === "TabWorkOrderPhotos") {
      iconName = faPhotoFilm;
      tabKey = "form_work_order_photos";
    }
  
    const isCompleted = completedForms.includes(tabKey);
    const iconColor = isCompleted ? "green" : color;
  
    return <FontAwesomeIcon icon={iconName} color={iconColor} size={20} />;
  };
  
  const ticketCode = `${sharedParams.codigo} OT#${sharedParams.numero_orden} `;

  return (
    <View style={{ flex: 1 }}>
      <Toolbar title={ticketCode} onBackPress={() => navigation.goBack()} />
      <WorkOrderFormCompletionProvider onFormCompleted={() => checkCompletedForms(true)}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: theme.colors.accent,
          tabBarInactiveTintColor: "white",
          tabBarStyle: {
            backgroundColor: theme.colors.secondaryDark,
          },
          tabBarIcon: ({ color }) => renderTabBarIcon({ route, color }),
          tabBarLabel: ({ color }) => renderTabBarLabel({ route, color }),
        })}
      >
        <Tab.Screen
          name="TabUnitDetail"
          component={TabUnitDetail}
          options={{
            title: "Unidad",
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faCircleInfo} color={color} size={20} />
            ),
          }}
          initialParams={sharedParams}
        />
        <Tab.Screen
          name="TabInstallationType"
          component={TabInstallationType}
          options={{
            title: "Instalación",
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faTools} color={color} size={20} />
            ),
          }}
          initialParams={sharedParams}
        />
        <Tab.Screen
          name="TabWorkOrderSupplies"
          component={TabWorkOrderSupplies}
          options={{
            title: "Materiales",
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon
                icon={faClipboardCheck}
                color={color}
                size={20}
              />
            ),
          }}
          initialParams={sharedParams}
        />
        <Tab.Screen
          name="TabEquipmentLocation"
          component={TabEquipmentLocation}
          options={{
            title: "Ubicación",
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faWrench} color={color} size={20} />
            ),
            swipeEnabled: false,
          }}
          initialParams={sharedParams}
        />
        <Tab.Screen 
          name="TabWorkOrderPhotos" 
          component={TabWorkOrderPhotos} 
          options={{
            title: "Fotos",
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faPhotoFilm} color={color} size={20} />
            ),
            swipeEnabled: false,
          }}
          initialParams={sharedParams}
        />
      </Tab.Navigator>
      </WorkOrderFormCompletionProvider>
    </View>
  );
};

export default TabNavigatorWorkOrder;
