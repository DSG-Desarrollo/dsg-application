import React from 'react';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import CustomLogo from '../components/atoms/CustomLogo';

const CustomDrawerContent = (props) => {
  const { navigation, setIsAuthenticated } = props;

  const handleNavigation = (routeName) => {
    navigation.navigate(routeName);
  };

  return (
    <DrawerContentScrollView {...props}>
      <CustomLogo
        source={require('../assets/images/LOGO_DSG_2020_NEW.png')}
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
        onPress={() => {
          setIsAuthenticated(false);
        }}
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="logout" color={color} size={size} />
        )}
      />
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
