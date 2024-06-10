import React, { useEffect, useState } from 'react';
import {
  SafeAreaProvider, initialWindowMetrics,
} from 'react-native-safe-area-context';
import { DefaultTheme, DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from './src/core/theme';
import { LoginScreen, ResetPasswordScreen } from './src/screens/Auth';
import DrawerNavigation from './src/navigation/DrawerNavigation';
import TicketDetailScreen from './src/screens/App/Tickets/TicketDetailScreen';
import TabNavigatorWorkOrder from './src/navigation/TabNavigatorWorkOrder';
import { DatabaseProvider } from './src/context/DatabaseContext';
import NetworkInfo from './src/utils/NetworkInfo';
import { getRememberSessionState } from './src/utils/storageUtils';
import * as ScreenOrientation from 'expo-screen-orientation';

const Stack = createStackNavigator();


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticatedValue = await getRememberSessionState();
        setIsAuthenticated(isAuthenticatedValue);
      } catch (error) {
        console.error('Error al verificar la autenticación:', error);
      }
    };

    checkAuthentication();
  }, []);

  if (isAuthenticated === null) {
    // Puedes mostrar un loader mientras se verifica la autenticación
    return null;
  }

  /*async function changeScreenOrientation() {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
  }

  useEffect(() => {
    const setupOrientation = async () => {
      try {
        const initialOrientation = await ScreenOrientation.getOrientationAsync();
        if (initialOrientation !== ScreenOrientation.Orientation.UNKNOWN) {
          await changeScreenOrientation();
        }
      } catch (error) {
        console.error('Error al obtener la orientación inicial:', error);
      }
    };
  
    setupOrientation();
  
    const subscription = ScreenOrientation.addOrientationChangeListener(handleOrientationChange);
  
    return () => {
      subscription.remove();
    };
  }, []);*/

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={theme}>
        <DatabaseProvider>
          <NetworkInfo>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                {isAuthenticated ? (
                  <Stack.Screen name="DrawerNavigation">
                    {(props) => <DrawerNavigation {...props} setIsAuthenticated={setIsAuthenticated} />}
                  </Stack.Screen>
                ) : (
                  <>
                    <Stack.Screen
                      name="LoginScreen"
                      options={{
                        title: 'Inicio de Sesión',
                      }}
                    >
                      {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
                    </Stack.Screen>
                    <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
                  </>
                )}
                <Stack.Screen name="TicketDetailScreen" component={TicketDetailScreen} options={{
                  headerBackTitle: 'Custom Back',
                  headerBackTitleStyle: { fontSize: 30 },
                }} />
                <Stack.Screen name="TabNavigatorWorkOrder" component={TabNavigatorWorkOrder} />
              </Stack.Navigator>
            </NavigationContainer>
          </NetworkInfo>
        </DatabaseProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
