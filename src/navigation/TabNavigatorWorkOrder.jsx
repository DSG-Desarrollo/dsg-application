import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCircleInfo,
  faTools,
  faClipboardCheck,
  faMapMarkerAlt,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { Text, View } from "react-native";
import {
  TabUnitDetail,
  TabInstallationType,
  TabWorkOrderSupplies,
  TabInstallationSignatureProof,
  TabEquipmentLocation,
} from "../screens/App/WorkOrders/";
import Toolbar from "../components/atoms/Toolbar";
import { useNavigation } from "@react-navigation/native";
import theme from "../themes/theme";

const Tab = createMaterialTopTabNavigator();

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
  const [completedForms, setCompletedForms] = useState([]);

  // Función para verificar qué formularios han sido completados
  const checkCompletedForms = async () => {
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
    } catch (error) {
      console.error("Error al verificar los formularios completados: ", error);
    }
  };

  useEffect(() => {
    checkCompletedForms();
  }, []);

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
    } else if (route.name === "TabInstallationSignatureProof") {
      labelName = "Firma";
      tabKey = "form_installation_signature_proof";
    } else if (route.name === "TabEquipmentLocation") {
      labelName = "Ubicación";
      tabKey = "form_equipment_location";
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
    } else if (route.name === "TabInstallationSignatureProof") {
      iconName = faMapMarkerAlt;
      tabKey = "form_installation_signature_proof";
    }
  
    const isCompleted = completedForms.includes(tabKey);
    const iconColor = isCompleted ? "green" : color;
  
    return <FontAwesomeIcon icon={iconName} color={iconColor} size={20} />;
  };
  

  const ticketCode = `${sharedParams.codigo} OT#${sharedParams.numero_orden} `;

  return (
    <View style={{ flex: 1 }}>
      <Toolbar title={ticketCode} onBackPress={() => navigation.goBack()} />
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
          name="TabInstallationSignatureProof"
          component={TabInstallationSignatureProof}
          options={{
            title: "Firma",
            tabBarIcon: ({ color }) => (
              <FontAwesomeIcon icon={faMapMarkerAlt} color={color} size={20} />
            ),
            swipeEnabled: false,
          }}
          initialParams={sharedParams}
        />
      </Tab.Navigator>
    </View>
  );
};

export default TabNavigatorWorkOrder;
