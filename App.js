import '@utils/installExpoBlobPolyfill';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import * as Localization from 'expo-localization';
import { LoginScreen, ResetPasswordScreen } from '@screens/Auth';
import DrawerNavigation from '@navigation/DrawerNavigator';
import TicketDetailScreen from '@screens/App/Tickets/TicketDetailScreen';
import TabNavigatorWorkOrder from '@navigation/TabNavigatorWorkOrder';
import { DatabaseProvider } from '@context/DatabaseContext';
import { SyncProvider } from '@context/SyncContext';
import { ThemeProvider, useTheme } from '@context/ThemeContext';
import { getLanguage, SUPPORTED_LANGUAGES } from '@services/storage/preferencesStorage';
import i18n from '@i18n/i18n';
import NetworkInfo from '@utils/NetworkInfo';
import { getSessionActive } from '@utils/storageUtils';
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

// Lee el idioma preferido (SPEC.md — Settings: idioma y tema, sección 9):
// preferencia guardada > idioma del dispositivo (si es soportado) > idioma
// por defecto ya configurado en la instancia de i18next.
const resolveInitialLanguage = async () => {
  const storedLanguage = await getLanguage();
  if (storedLanguage) {
    return storedLanguage;
  }

  const deviceLocales = Localization.getLocales();
  const deviceLanguageTag = deviceLocales[0]?.languageTag;
  const deviceLanguageCode = deviceLocales[0]?.languageCode;

  if (SUPPORTED_LANGUAGES.includes(deviceLanguageTag)) {
    return deviceLanguageTag;
  }
  if (SUPPORTED_LANGUAGES.includes(deviceLanguageCode)) {
    return deviceLanguageCode;
  }

  return i18n.language;
};

const AppContent = () => {
  const {
    resolvedTheme, paperTheme, navigationTheme, colors, isThemeLoaded,
  } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Bloquea el render del Navigator (que por defecto monta LoginScreen)
  // hasta saber si ya hay una sesión persistida. Sin esto, LoginScreen se
  // ve un instante aunque el usuario tenga "recordar sesión" activo.
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

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

  useEffect(() => {
    const bootstrapLanguage = async () => {
      try {
        const initialLanguage = await resolveInitialLanguage();
        if (initialLanguage !== i18n.language) {
          await i18n.changeLanguage(initialLanguage);
        }
      } catch (error) {
        console.error('Error al inicializar el idioma:', error);
      } finally {
        setIsLanguageLoaded(true);
      }
    };

    bootstrapLanguage();
  }, []);

  const isReady = isThemeLoaded && isLanguageLoaded && !isCheckingSession;

  if (!isReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <PaperProvider theme={paperTheme}>
          <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
          <DatabaseProvider>
            <SyncProvider>
              <NetworkInfo>
                <NavigationContainer theme={navigationTheme}>
                  <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
            </SyncProvider>
          </DatabaseProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const App = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
