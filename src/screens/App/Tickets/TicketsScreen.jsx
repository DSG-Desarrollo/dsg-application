import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBell,
  faCheckCircle,
  faPlayCircle,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import TicketsTab from "./TicketsTab";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createMaterialTopTabNavigator();

const tabScreensConfig = [
  {
    name: "TicketsOfDayScreen",
    icon: faCalendarCheck,
    filters: {
      id_tipo_usuario: 5,
      progressTask: ["P"],
    },
    checkNetwork: true,
    badgeCount: 5, // Simulated badge count
  },
  {
    name: "TicketsStarted",
    icon: faPlayCircle,
    filters: {
      id_tipo_usuario: 5,
      progressTask: ["I"],
    },
    checkNetwork: false,
    badgeCount: 3, // Simulated badge count
  },
  {
    name: "Alarms",
    icon: faBell,
    filters: {
      id_tipo_usuario: 5,
      id_tipo_tarea: 18,
      progressTask: ["I", "P", "C"],
    },
    checkNetwork: false,
    badgeCount: 7, // Simulated badge count
  },
  {
    name: "TicketsCompleted",
    icon: faCheckCircle,
    filters: {
      id_tipo_usuario: 5,
      progressTask: ["C"],
    },
    checkNetwork: false,
    badgeCount: 2, // Simulated badge count
  },
];

const TicketsScreen = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("userData");
        setUserData(jsonValue ? JSON.parse(jsonValue) : null);
      } catch (e) {
        console.error("Error reading userData from storage", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName="TicketsOfDayScreen"
      screenOptions={({ route }) => {
        const { icon, badgeCount } = tabScreensConfig.find(
          (screen) => screen.name === route.name
        );

        return {
          tabBarActiveTintColor: "blue",
          tabBarInactiveTintColor: "gray",
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => (
            <FontAwesomeIcon icon={icon} size={20} color={color} />
          ),
          tabBarBadge:
            badgeCount > 0
              ? () => (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{badgeCount}</Text>
                  </View>
                )
              : null,
        };
      }}
    >
      {tabScreensConfig.map(({ name, filters, checkNetwork }) => (
        <Tab.Screen
          key={name}
          name={name}
          children={() => (
            <TicketsTab
              filters={{
                ...filters,
                id_usuario: userData.employee.id_empleado,
                id_tipo_usuario: userData.id_tipo_usuario,
              }}
              checkNetwork={checkNetwork}
              userData={userData}
            />
          )}
        />
      ))}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: "#4CAF50", // Rojo brillante para captar la atención
    borderRadius: 10, // Bordes redondeados, más pronunciado para modernidad
    minWidth: 20, // Ancho mínimo para acomodar el número
    paddingHorizontal: 6, // Relleno horizontal para el texto
    height: 20, // Altura fija
    alignItems: "center", // Centrar el texto horizontalmente
    justifyContent: "center", // Centrar el texto verticalmente
    position: "absolute", // Posición absoluta para superponer el icono
    top: 6, // Mover hacia arriba para acercar a la parte superior
    right: 28, // Mover hacia la derecha para acercar a la esquina derecha
    borderWidth: 2, // Borde para hacer el badge más visible
    borderColor: "#FFFFFF", // Blanco para resaltar el borde sobre el fondo rojo
    shadowColor: "#000", // Sombra para darle un efecto de profundidad
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.3, // Opacidad de la sombra
    shadowRadius: 2, // Radio de la sombra
    elevation: 3, // Elevación para sombra en Android
  },
  badgeText: {
    color: "white", // Color del texto
    fontSize: 12, // Tamaño del texto ligeramente más grande para legibilidad
    fontWeight: "bold", // Texto en negrita para destacar
    textAlign: "center", // Centrar el texto
  },
});

export default TicketsScreen;
