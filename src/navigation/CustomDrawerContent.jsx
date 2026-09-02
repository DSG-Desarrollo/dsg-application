import React from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import CustomLogo from '@components/atoms/CustomLogo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomDrawerContent = (props) => {
  const { navigation, setIsAuthenticated } = props;

  const handleNavigation = (routeName) => {
    navigation.navigate(routeName);
  };

  const handleLogout = async () => {
    try {
      // Limpiamos la sesión persistida; si no, con "recordar sesión" activo
      // la app volvería a entrar automáticamente con el usuario anterior
      // la próxima vez que se abra. No tocamos 'rememberSessionPreference':
      // es la preferencia del switch, no debe resetearse al cerrar sesión.
      await AsyncStorage.multiRemove(['userData', 'sessionActive']);
    } catch (error) {
      console.error('Error al limpiar la sesión almacenada:', error);
    }
    // No usar navigation.dispatch(CommonActions.reset(...)) aquí: App.js ya
    // cambia el stack a LoginScreen en cuanto isAuthenticated es false.
    // Despachar un reset además de eso produce "RESET action not handled".
    setIsAuthenticated(false);
  };
  
  return (
    <DrawerContentScrollView {...props}>
      <CustomLogo
        source={require('@assets/images/LOGO_DSG_2020_NEW.png')}
        width={250} // Ajusta el ancho según sea necesario
        height={75} // Ajusta el alto según sea necesario
      />
      <DrawerItemList
        {...props}
        onItemPress={(route) => {
          handleNavigation(route.route.name);
        }}
      />
      <DrawerItem
        label="Cerrar sesión"
        onPress={handleLogout}
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="logout" color={color} size={size} />
        )}
      />
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
