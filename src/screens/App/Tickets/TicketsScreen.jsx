import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faInfoCircle, faComment, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { TicketsOfDayScreen, TicketDetails, TicketComments, TicketAlarms } from './index';

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

          if (route.name === 'Details') {
            icon = faInfoCircle;
          } else if (route.name === 'Comments') {
            icon = faComment;
          } else if (route.name === 'TicketsOfDayScreen') {
            icon = faCalendarAlt;
          }

          return <FontAwesomeIcon icon={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TicketsOfDayScreen" component={TicketsOfDayScreen} />
      <Tab.Screen name="Details" component={TicketDetails} />
      <Tab.Screen name="Comments" component={TicketComments} />
    </Tab.Navigator>
  );
};

export default TicketsScreen;
