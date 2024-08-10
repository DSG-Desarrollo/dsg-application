import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBell,
  faCheckCircle,
  faPlayCircle,
  faCalendarCheck,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TicketsOfDayScreen,
  TicketsStarted,
  TicketsCompleted,
  TicketAlarms,
  TicketsExtraHours,
} from "./index";

const Tab = createMaterialTopTabNavigator();

const TicketsScreen = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray",
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size }) => {
          let icon;

          switch (route.name) {
            case "TicketsStarted":
              icon = faPlayCircle;
              break;
            case "TicketsCompleted":
              icon = faCheckCircle;
              break;
            case "TicketsOfDayScreen":
              icon = faCalendarCheck;
              break;
            case "Alarms":
              icon = faBell;
              break;
            case "TicketsExtraHours":
              icon = faHourglassHalf;
              break;
          }

          return <FontAwesomeIcon icon={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="TicketsOfDayScreen"
        component={TicketsOfDayScreen}
        initialParams={{ userData }}
      />
      <Tab.Screen
        name="TicketsStarted"
        component={TicketsStarted}
        initialParams={{ userData }}
      />
      <Tab.Screen
        name="Alarms"
        component={TicketAlarms}
        initialParams={{ userData }}
      />
      <Tab.Screen
        name="TicketsExtraHours"
        component={TicketsExtraHours}
        initialParams={{ userData }}
      />
      <Tab.Screen
        name="TicketsCompleted"
        component={TicketsCompleted}
        initialParams={{ userData }}
      />
    </Tab.Navigator>
  );
};

export default TicketsScreen;
