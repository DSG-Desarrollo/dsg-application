import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from "react-native";
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faBell,
  faCheckCircle,
  faPlayCircle,
  faCalendarCheck,
  faHourglassHalf,
} from '@fortawesome/free-solid-svg-icons';
import TicketsTab from './TicketsTab';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useNetworkState from '../../../hooks/useNetworkState'; // Importa tu custom hook

const Tab = createMaterialTopTabNavigator();

const TicketsScreen = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { networkState } = useNetworkState(); // Usa el hook para obtener el estado de la red

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userData');
        const parsedUserData = jsonValue != null ? JSON.parse(jsonValue) : null;
        setUserData(parsedUserData);
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

  // Definir los componentes de cada pestaña
  const TicketsOfDayScreen = () => (
    <TicketsTab
      filters={{ id_puesto_empleado: userData.employee.id_empleado, progress: '[P]', alarms: false }}
      checkNetwork={networkState.isConnected} // Pasar el estado de la red
      userData={userData}
    />
  );

  const TicketsStartedScreen = () => (
    <TicketsTab
      filters={{ id_puesto_empleado: userData.employee.id_empleado, progress: '[I]', alarms: false }}
      checkNetwork={networkState.isConnected} // Pasar el estado de la red
      userData={userData}
    />
  );

  const AlarmsScreen = () => (
    <TicketsTab
      filters={{ id_puesto_empleado: userData.employee.id_empleado, alarms: true, progress: '[C, V, T, S, A]'}}
      checkNetwork={networkState.isConnected} // Pasar el estado de la red
      userData={userData}
    />
  );

  const TicketsExtraHoursScreen = () => (
    <TicketsTab
      filters={{ id_puesto_empleado: userData.employee.id_empleado, extra_hours: true, progress: '[P]', alarms: true }}
      checkNetwork={networkState.isConnected} // Pasar el estado de la red
      userData={userData}
    />
  );

  const TicketsCompletedScreen = () => (
    <TicketsTab
      filters={{ id_puesto_empleado: userData.employee.id_empleado, progress: '[C]', alarms: true }}
      checkNetwork={networkState.isConnected} // Pasar el estado de la red
      userData={userData}
    />
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        tabBarIcon: ({ color }) => {
          let icon;
          switch (route.name) {
            case 'TicketsStarted':
              icon = faPlayCircle;
              break;
            case 'TicketsCompleted':
              icon = faCheckCircle;
              break;
            case 'TicketsOfDayScreen':
              icon = faCalendarCheck;
              break;
            case 'Alarms':
              icon = faBell;
              break;
            case 'TicketsExtraHours':
              icon = faHourglassHalf;
              break;
          }
          return <FontAwesomeIcon icon={icon} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TicketsOfDayScreen">{() => <TicketsOfDayScreen />}</Tab.Screen>
      <Tab.Screen name="TicketsStarted">{() => <TicketsStartedScreen />}</Tab.Screen>
      <Tab.Screen name="Alarms">{() => <AlarmsScreen />}</Tab.Screen>
      <Tab.Screen name="TicketsExtraHours">{() => <TicketsExtraHoursScreen />}</Tab.Screen>
      <Tab.Screen name="TicketsCompleted">{() => <TicketsCompletedScreen />}</Tab.Screen>
    </Tab.Navigator>
  );
};

export default TicketsScreen;
