import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import CustomDrawerContent from "./CustomDrawerContent";
import { routes } from "../data/routes";

const Drawer = createDrawerNavigator();

const filteredRoutes = Object.entries(routes)
  .filter(([key, value]) => value.isActive === 1)
  .sort((a, b) => a[1].order - b[1].order)
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

const DrawerNavigation = ({ setIsAuthenticated }) => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          setIsAuthenticated={setIsAuthenticated}
        />
      )}
      screenOptions={{
        drawerLabelStyle: {
          fontFamily: "Roboto",
          fontSize: 16,
        },
      }}
    >
      {Object.keys(filteredRoutes).map((routeName) => (
        <Drawer.Screen
          key={routeName}
          name={filteredRoutes[routeName].name}
          component={filteredRoutes[routeName].screen}
          options={{
            drawerLabel: filteredRoutes[routeName].title,
            drawerIcon: ({ color, size }) => (
              <FontAwesomeIcon
                icon={filteredRoutes[routeName].iconName}
                color={color}
                size={size}
              />
            ),
          }}
        />
      ))}
    </Drawer.Navigator>
  );
};

export default DrawerNavigation;
