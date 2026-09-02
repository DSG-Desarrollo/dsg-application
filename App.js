import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import {
  DefaultTheme,
  DarkTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from '@core/theme';
import { LoginScreen, ResetPasswordScreen } from '@screens/Auth';
import DrawerNavigation from '@navigation/DrawerNavigator';
import TicketDetailScreen from '@screens/App/Tickets/TicketDetailScreen';
import TabNavigatorWorkOrder from '@navigation/TabNavigatorWorkOrder';
import { DatabaseProvider } from '@context/DatabaseContext';
import NetworkInfo from '@utils/NetworkInfo';
import { getSessionActive } from '@utils/storageUtils';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Bloquea el render del Navigator (que por defecto monta LoginScreen)
  // hasta saber si ya hay una sesión persistida. Sin esto, LoginScreen se
  // ve un instante aunque el usuario tenga "recordar sesión" activo.
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const sessionActive = await getSessionActive();
        setIsAuthenticated(sessionActive);
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkAuthentication();
  }, []);

  if (isCheckingSession) {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <PaperProvider theme={theme}>
        <DatabaseProvider>
          <NetworkInfo>
            <NavigationContainer>
              <SafeAreaView style={{ flex: 1 }}>
                <Stack.Navigator
                  initialRouteName={isAuthenticated ? 'DrawerNavigation' : 'LoginScreen'}
                  screenOptions={{ headerShown: false }}
                >
                  {isAuthenticated ? (
                    <Stack.Screen name="DrawerNavigation">
                      {(props) => <DrawerNavigation {...props} setIsAuthenticated={setIsAuthenticated} />}
                    </Stack.Screen>
                  ) : (
                    <Stack.Screen
                      name="LoginScreen"
                      options={{
                        title: 'Inicio de Sesión',
                      }}
                    >
                      {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
                    </Stack.Screen>
                  )}
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
