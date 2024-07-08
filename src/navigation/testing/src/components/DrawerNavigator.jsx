import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import CustomDrawerContent from './CustomDrawerContent';
import { routes } from '../../../../data/routes';

const Drawer = createDrawerNavigator();

const filteredRoutes = Object.entries(routes)
  .sort((a, b) => a[1].order - b[1].order)
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

const DrawerNavigation = () => {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      {Object.keys(filteredRoutes).map((routeName) => (
        <Drawer.Screen
          key={routeName}
          name={filteredRoutes[routeName].name}
          component={filteredRoutes[routeName].screen}
          options={{
            drawerLabel: filteredRoutes[routeName].title,
            drawerIcon: ({ color, size }) => (
              <FontAwesomeIcon icon={filteredRoutes[routeName].iconName} color={color} size={size} />
            ),
          }}
        />
      ))}
    </Drawer.Navigator>
  );
}

export default DrawerNavigation;