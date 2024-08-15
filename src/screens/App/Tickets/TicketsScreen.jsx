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

const Tab = createMaterialTopTabNavigator();

const tabScreensConfig = [
  {
    name: "TicketsOfDayScreen",
    icon: faCalendarCheck,
    filters: {
      alarms: false,
      progress: ['P']
    },
    checkNetwork: true,
  },
  {
    name: "TicketsStarted",
    icon: faPlayCircle,
    filters: { 
      alarms: false,
      progress: ['I'] 
    },
    checkNetwork: false,
  },
  {
    name: "Alarms",
    icon: faBell,
    filters: {
      alarms: true,
    },
    checkNetwork: false,
  },
  /*{
    name: "TicketsExtraHours",
    icon: faHourglassHalf,
    filters: { extra_hours: true },
    checkNetwork: false,
  },*/
  {
    name: "TicketsCompleted",
    icon: faCheckCircle,
    filters: { 
      alarms: false,
      progress: ['C'] 
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
        const jsonValue = await AsyncStorage.getItem('userData');
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
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        tabBarIcon: ({ color }) => {
          const { icon } = tabScreensConfig.find(screen => screen.name === route.name);
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
              filters={{ ...filters, id_puesto_empleado: userData.employee.id_empleado }}
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
