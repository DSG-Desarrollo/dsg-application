import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import Background from '@components/atoms/Background';
import Logo from '@components/atoms/Logo';
import Header from '@components/atoms/Header';
import Button from '@components/atoms/Button';
import TextInput from '@components/atoms/TextInput';
import PasswordInput from '@components/molecules/PasswordInput';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { loginScreenStyles } from '../../styles';
import i18n from '@i18n/i18n';
import { useDatabase } from '@context/DatabaseContext';
import UserService from '@services/api/users/UserService';
import { queries } from '@services/database/queries';
import useNetworkState from '@hooks/useNetworkState';
import { storeAuthenticationState, getRememberSessionState } from '@utils/storageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { md5 } from '@utils/md5';
import LoadingOverlay from '@components/atoms/LoadingOverlay';
import Switch from '@components/atoms/Switch';

const userService = new UserService();
const { users, userInserts } = queries;

export default function LoginScreen({ navigation, setIsAuthenticated }) {
  const { networkState } = useNetworkState();
  const { isConnected } = networkState;
  const { databaseContext, getAllAsyncSql, getFirstAsyncSql, isDatabaseInitialized, executeSql } = useDatabase();
  const [rememberSession, setRememberSession] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [email, setUsuario] = useState({
    value: 'emerson.martinez',
    error: '',
  });
  const [password, setPassword] = useState({ value: 'Dsg2022Wt5', error: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para manejar el cambio de estado de "Recordar sesión"
  const onRememberMeChange = async (value) => {
    setRememberSession(value);
    await storeAuthenticationState(value);
  };

  // Función para insertar un usuario en la base de datos local
  async function insertUserToDatabase(userData) {
    const args = [
      userData.id_usuario,
      userData.id_tipo_usuario,
      userData.usuario,
      userData.clave,
      userData.estado_usuario,
      userData.observacion,
      userData.foto_nombre,
      userData.registro_usuario
    ];

    const checkArgs = [userData.id_usuario];

    try {
      const existingUsers = await getAllAsyncSql(users.checkUserExistence, checkArgs);
      if (existingUsers.length > 0) {
        console.log('El usuario ya existe, no se insertará.');
        return;
      }

      await executeSql(userInserts.insertUser, args);
      console.log('Inserción de usuario exitosa');
    } catch (error) {
      console.error('Error al insertar usuario:', error);
    }
  }

  // Cargar el estado de "Recordar sesión" al montar el componente
  useEffect(() => {
    const loadRememberSessionState = async () => {
      const rememberSessionState = await getRememberSessionState();
      setRememberSession(rememberSessionState);
    };

    loadRememberSessionState();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (isDatabaseInitialized) {
        const result = await getAllAsyncSql(users.getUsersAll);
        setUsuarios(result.rows);
      }
    };

    fetchUsers();
  }, [isDatabaseInitialized]);
  //console.log("ID",userData);

  // Función para manejar el inicio de sesión
  const onLoginPressed = async () => {
    if (!email.value || !password.value) {
      Alert.alert('Error', 'Por favor, ingrese su email y contraseña.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!isConnected) {
        // Sin conexión a internet: antes esta rama solo comprobaba si
        // existía *algún* usuario cacheado ligado a la última sesión
        // (userData.id_usuario), ignorando por completo el email/contraseña
        // que la persona acababa de escribir en el formulario — cualquier
        // texto en el campo de contraseña quedaba autenticado si había una
        // sesión previa guardada. Ahora sí validamos las credenciales
        // ingresadas contra la copia local (SQLite) del último login
        // exitoso, igual que hace el backend (usuario + hash MD5 de clave).
        const localUser = await getFirstAsyncSql(users.getUserByUsername, [email.value]);
        const credentialsMatch =
          localUser &&
          localUser.estado_usuario === 'A' &&
          localUser.clave === md5(password.value);

        if (credentialsMatch) {
          setIsAuthenticated(true);
          Alert.alert('Éxito', 'Inicio de sesión exitoso sin conexión.');
        } else {
          Alert.alert('Error', 'Usuario o contraseña incorrectos.');
          return;
        }
      } else {
        // Con conexión a internet
        const response = await userService.login(email.value, password.value);

        if (response && response.user && response.user.estado_usuario === 'A') {
          if (!response.user.employee) {
            // El login fue exitoso pero el backend no devolvió la relación
            // 'employee' (User::with('employee.position')) para este usuario.
            // Sin esto, pantallas como Tickets no pueden resolver
            // userData.employee.id_empleado.
            console.warn('El usuario autenticado no tiene datos de "employee" asociados:', response.user);
          }
          // Persistimos los datos ANTES de marcar al usuario como autenticado,
          // ya que el cambio de isAuthenticated desmonta LoginScreen y monta
          // DrawerNavigation (que lee 'userData' de AsyncStorage de inmediato).
          await AsyncStorage.setItem('userData', JSON.stringify(response.user));
          //const usersHttpDB = await getFirstAsyncSql(users.getUserById, [response.user.id_usuario]);
          await insertUserToDatabase(response.user);
          // No usar navigation.replace aquí: App.js ya cambia de stack a
          // DrawerNavigation en cuanto isAuthenticated es true. Llamar a
          // replace además de eso produce "RESET action not handled".
          setIsAuthenticated(true);
        } else {
          Alert.alert('Error', 'Inicio de sesión fallido.');
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      if (error.isCredentialsError) {
        // El servidor respondió y rechazó explícitamente el usuario/clave.
        Alert.alert('Error', 'Usuario o contraseña incorrectos.');
      } else {
        // Falla de red/servidor (timeout, sin conexión al backend, etc.),
        // no un rechazo de credenciales.
        Alert.alert(
          'Error',
          'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
        );
      }
    } finally {
      // Si el login fue exitoso, setIsAuthenticated(true) ya desmontó (o está
      // por desmontar) esta pantalla; actualizar isSubmitting en ese caso es
      // inofensivo. En cualquier otro desenlace, esto reactiva el botón.
      setIsSubmitting(false);
    }
  };
  
  return (
    <LoadingOverlay visible={isSubmitting} fullscreen text={i18n.t('common:connecting')}>
      <Background>
        <Logo
          source={require('@assets/images/ESCUDO_LOGO_DSG_2020_FONDO_BLANCO.png')}
          size={110}
          style={{ marginBottom: 16 }}
        />
        <Header>{i18n.t('auth:welcome')}</Header>
        <TextInput
          label={i18n.t('auth:username')}
          returnKeyType="next"
          value={email.value}
          onChangeText={(text) => setUsuario({ value: text, error: '' })}
          error={!!email.error}
          errorText={email.error}
          autoCapitalize="none"
          autoCompleteType="email"
          textContentType="emailAddress"
          keyboardType="email-address"
        />
        <PasswordInput
          label={i18n.t('auth:password')}
          value={password.value}
          onChangeText={(text) => setPassword({ value: text, error: '' })}
          errorText={password.error}
        />
        <View style={loginScreenStyles.forgotRememberContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ResetPasswordScreen')}
          >
            <Text style={loginScreenStyles.forgot}>{i18n.t('auth:forgotPassword')}</Text>
          </TouchableOpacity>
          <View style={loginScreenStyles.rememberContainer}>
            <Text style={loginScreenStyles.rememberText}>{i18n.t('auth:rememberSession')}</Text>
            <Switch
              value={rememberSession}
              onValueChange={onRememberMeChange}
            />
          </View>
        </View>
        <Button
          mode="contained"
          onPress={onLoginPressed}
          disabled={isSubmitting}
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          )}
        >
          {i18n.t('auth:login')}
        </Button>
      </Background>
    </LoadingOverlay>
  );
}
