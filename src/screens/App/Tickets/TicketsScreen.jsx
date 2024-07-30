import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBell,
  faCheckCircle,
  faPlayCircle,
  faCalendarCheck,
  faHourglassHalf,
} from "@fortawesome/free-solid-svg-icons";
import {
  TicketsOfDayScreen,
  TicketsStarted,
  TicketsCompleted,
  TicketAlarms,
  TicketsExtraHours,
} from "./index";

const Tab = createMaterialTopTabNavigator();

const TicketsScreen = () => {
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
      <Tab.Screen name="TicketsOfDayScreen" component={TicketsOfDayScreen} />
      <Tab.Screen name="TicketsStarted" component={TicketsStarted} />
      <Tab.Screen name="Alarms" component={TicketAlarms} />
      <Tab.Screen name="TicketsExtraHours" component={TicketsExtraHours} />
      <Tab.Screen name="TicketsCompleted" component={TicketsCompleted} />
    </Tab.Navigator>
  );
};

export default TicketsScreen;
