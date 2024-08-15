import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCamera,
  faListAlt,
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
    progresoOrdenTrabajo
  } = route.params;
  const renderTabBarLabel = ({ route, color }) => {
    let labelName;

    if (route.name === "TabUnitDetail") {
      labelName = "Unidad";
    } else if (route.name === "TabInstallationType") {
      labelName = "Instalación";
    } else if (route.name === "TabWorkOrderSupplies") {
      labelName = "Materiales";
    } else if (route.name === "TabInstallationSignatureProof") {
      labelName = "Firma";
    } else if (route.name === "TabEquipmentLocation") {
      labelName = "Ubicación";
    }

    return <Text style={{ color }}>{labelName}</Text>;
  };
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
    progresoOrdenTrabajo
  };
  const ticketCode = `${sharedParams.codigo} OT#${sharedParams.numero_orden} `;
  console.log(sharedParams);
  
  return (
    <View style={{ flex: 1 }}>
      <Toolbar
        title={ticketCode}
        onBackPress={() => navigation.goBack()}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: "#efb810",
          tabBarInactiveTintColor: "white",
          tabBarStyle: {
            backgroundColor: "#003F75",
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
              <FontAwesomeIcon icon={faTools} color={color} size={20} />
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
