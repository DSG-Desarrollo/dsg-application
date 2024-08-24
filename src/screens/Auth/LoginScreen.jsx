import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Switch, View, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import Background from '../../components/atoms/Background';
import Logo from '../../components/atoms/Logo';
import Header from '../../components/atoms/Header';
import Button from '../../components/atoms/Button';
import TextInput from '../../components/atoms/TextInput';
import PasswordInput from '../../components/molecules/PasswordInput';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import { loginScreenStyles } from '../../styles';
import ToastManager from '../../utils/ToastManager';
import i18n from '../../../i18n';
import { useDatabase } from '../../context/DatabaseContext';
import UserService from '../../services/api/users/UserService';
import { queries } from '../../services/database/queries';
import useNetworkState from '../../hooks/useNetworkState';
import { getUserDataFromStorage, storeAuthenticationState, getRememberSessionState } from '../../utils/storageUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const userService = new UserService();
const { users, userInserts } = queries;

export default function LoginScreen({ navigation, setIsAuthenticated }) {
  const { networkState } = useNetworkState();
  const { isConnected } = networkState;
  const { databaseContext, getAllAsyncSql, getFirstAsyncSql, isDatabaseInitialized, executeSql } = useDatabase();
  const [rememberSession, setRememberSession] = useState(false);
  const [userData, setUserData] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [email, setUsuario] = useState({
    value: 'diego.martinez',
    error: '',
  });
  const [password, setPassword] = useState({ value: 'Diego0809', error: '' });

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

  async function fetchAllUsers() {
    try {
      const allUsers = await getAllAsyncSql(users.getUsersAll);
      setUsuarios(allUsers);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
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

  // Obtener datos del usuario almacenados al montar el componente
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataFromStorage = await getUserDataFromStorage();
        if (userDataFromStorage === null) {
          setError('No se encontraron datos de usuario en el almacenamiento.');
        } else {
          setUserData(userDataFromStorage);
        }
      } catch (error) {
        setError('Error al recuperar datos de usuario del almacenamiento.');
      }
    };

    fetchUserData();
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

    try {
      if (!isConnected) {
        // Sin conexión a internet
        const userId = userData ? userData.id_usuario : null;
        const usersDB = await getAllAsyncSql(users.getUserById, [userId]);
        console.log(usersDB);
        if (usersDB.length > 0) {
          setIsAuthenticated(true);
          Alert.alert('Éxito', 'Inicio de sesión exitoso sin conexión.');
        } else {
          Alert.alert('Error', 'Usuario no encontrado en la base de datos local.');
          return;
        }
      } else {
        // Con conexión a internet
        const response = await userService.login(email.value, password.value);

        if (response && response.user && response.user.estado_usuario === 'A') {
          setIsAuthenticated(true);
          await AsyncStorage.setItem('userData', JSON.stringify(response.user));
          //const usersHttpDB = await getFirstAsyncSql(users.getUserById, [response.user.id_usuario]);
          await insertUserToDatabase(response.user);
          navigation.replace('DrawerNavigation');
        } else {
          Alert.alert('Error', 'Inicio de sesión fallido.');
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', `Error al iniciar sesión: ${error.message}`);
    }
  };
  //console.log(users.getUserById);
  return (
    <Background>
      <Logo
        source={require('../../assets/images/ESCUDO_LOGO_DSG_2020_FONDO_BLANCO.png')}
        size={110}
        style={{ marginBottom: 16, borderWidth: 2 }}
      />
      <Header>{i18n.t('welcome')}</Header>
      <TextInput
        label={i18n.t('username')}
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
        label={i18n.t('password')}
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        errorText={password.error}
      />
      <View style={loginScreenStyles.forgotRememberContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ResetPasswordScreen')}
        >
          <Text style={loginScreenStyles.forgot}>{i18n.t('forgotPassword')}</Text>
        </TouchableOpacity>
        <View style={loginScreenStyles.rememberContainer}>
          <Text style={loginScreenStyles.rememberText}>{i18n.t('rememberSession')}</Text>
          <Switch
            value={rememberSession}
            onValueChange={onRememberMeChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={rememberSession ? '#003F75' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>
      <Button
        mode="contained"
        onPress={onLoginPressed}
        icon={({ color, size }) => (
          <MaterialCommunityIcons name="account" color={color} size={size} />
        )}
      >
        {i18n.t('login')}
      </Button>
    </Background>
  );
}
