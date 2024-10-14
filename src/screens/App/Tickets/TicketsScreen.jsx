import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBell,
  faCheckCircle,
  faPlayCircle,
  faCalendarCheck,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import TicketsTab from "./TicketsTab";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Tab = createBottomTabNavigator();

const tabScreensConfig = [
  {
    name: "TicketsOfDayScreen",
    icon: faCalendarCheck,
    filters: {
      id_tipo_usuario: 5,
      progressTask: ["P"],
    },
    checkNetwork: true,
  },
  {
    name: "TicketsStarted",
    icon: faPlayCircle,
    filters: {
      id_tipo_usuario: 5,
      progressTask: ["I"],
    },
    checkNetwork: false,
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
  },
  {
    name: "TicketsCompleted",
    icon: faCheckCircle,
    filters: {
      id_tipo_usuario: 5,
      progressTask: ["C"],
    },
    checkNetwork: false,
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
      initialRouteName="TicketsOfDayScreen" // Set the default tab to the first one
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: false,
        headerShown: false,
        tabBarIcon: ({ color }) => {
          const { icon } = tabScreensConfig.find(
            (screen) => screen.name === route.name
          );
          return <FontAwesomeIcon icon={icon} size={20} color={color} />;
        },
      })}
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

export default TicketsScreen;
