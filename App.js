import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import {
  DefaultTheme,
  DarkTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from './src/core/theme';
import { LoginScreen, ResetPasswordScreen } from './src/screens/Auth';
import DrawerNavigation from './src/navigation/testing/src/components/DrawerNavigator';
import TicketDetailScreen from './src/screens/App/Tickets/TicketDetailScreen';
import TabNavigatorWorkOrder from './src/navigation/TabNavigatorWorkOrder';
import { DatabaseProvider } from './src/context/DatabaseContext';
import NetworkInfo from './src/utils/NetworkInfo';
import { getRememberSessionState } from './src/utils/storageUtils';

const Stack = createStackNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthenticatedValue = await getRememberSessionState();
        setIsAuthenticated(isAuthenticatedValue);
      } catch (error) {
        console.error('Error al verificar la autenticación:', error);
        // Podrías mostrar un mensaje al usuario sobre el error de autenticación
      }
    };

    checkAuthentication();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={theme}>
        <DatabaseProvider>
          <NetworkInfo>
            <NavigationContainer>
              <SafeAreaView style={{ flex: 1 }}>
                <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                    name="LoginScreen"
                    options={{
                      title: 'Inicio de Sesión',
                    }}
                  >
                    {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
                  </Stack.Screen>

                  <Stack.Screen name="DrawerNavigation">
                    {(props) => <DrawerNavigation {...props} setIsAuthenticated={setIsAuthenticated} />}
                  </Stack.Screen>

                  <Stack.Screen
                    name="ResetPasswordScreen"
                    component={ResetPasswordScreen}
                  />

                  <Stack.Screen
                    name="TicketDetailScreen"
                    component={TicketDetailScreen}
                    options={{
                      headerBackTitle: 'Custom Back',
                      headerBackTitleStyle: { fontSize: 30 },
                    }}
                  />

                  <Stack.Screen
                    name="TabNavigatorWorkOrder"
                    component={TabNavigatorWorkOrder}
                  />
                </Stack.Navigator>
              </SafeAreaView>
            </NavigationContainer>
          </NetworkInfo>
        </DatabaseProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
