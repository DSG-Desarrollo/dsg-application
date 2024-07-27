import React, { useEffect, useState } from 'react';
import Spinner from '../components/atoms/Spinner';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import CustomDrawerContent from './CustomDrawerContent';
import { routes } from '../data/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();

const DrawerNavigation = ({ setIsAuthenticated }) => {
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserDataFromAsyncStorage = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        //console.log('AsyncStorage: ', userDataString);
        if (userDataString) {
          const userDataObject = JSON.parse(userDataString);
          setUserLevel(userDataObject.id_tipo_usuario);
        } else {
          console.log('No se encontraron datos de usuario en AsyncStorage');
        }
      } catch (error) {
        console.error('Error al cargar datos de usuario desde AsyncStorage:', error);
      }
      setLoading(false); // Marca la carga como completada independientemente del resultado
    };

    loadUserDataFromAsyncStorage();
  }, []);

  if (loading) {
    return <Spinner size="large" color="#0000ff" />;
  }

  const filteredRoutes = Object.entries(routes)
    .filter(([key, value]) => value.requiredLevel.includes(userLevel))
    .sort((a, b) => a[1].order - b[1].order)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} setIsAuthenticated={setIsAuthenticated} />}>
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
};

export default DrawerNavigation;