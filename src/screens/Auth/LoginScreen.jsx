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
  const databaseContext = useDatabase();
  const [rememberSession, setRememberSession] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [email, setUsuario] = useState({
    value: 'emerson.martinez',
    error: '',
  });
  const [password, setPassword] = useState({ value: 'Dsg2022Wt5', error: '' });
  const onRememberMeChange = async (value) => {
    setRememberSession(value);
    await storeAuthenticationState(value);
  };
  const showToast = () => {
    ToastManager.showToast('¡Esto es una tostada de ejemplo!');
  };

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

    try {
      await databaseContext.executeSql(userInserts.insertUser, args);
      console.log('Inserción de usuario exitosa');
    } catch (error) {
      console.error('Error al insertar usuario:', error);
    }
  }

  useEffect(() => {
    const loadRememberSessionState = async () => {
      const rememberSessionState = await getRememberSessionState();
      setRememberSession(rememberSessionState);
    };

    loadRememberSessionState();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Intentamos obtener userData del almacenamiento
        const userDataFromStorage = await getUserDataFromStorage();

        // Si userDataFromStorage es null, significa que no hay datos de usuario en el almacenamiento
        if (userDataFromStorage === null) {
          setError('No se encontraron datos de usuario en el almacenamiento.');
        } else {
          // Si se encontraron datos de usuario, los establecemos en el estado
          setUserData(userDataFromStorage);
        }
      } catch (error) {
        // Si hay un error al recuperar userData del almacenamiento, lo manejamos aquí
        setError('Error al recuperar datos de usuario del almacenamiento.');
      } finally {
        // Finalizamos la carga, independientemente de si fue exitosa o hubo un error
        //setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const onLoginPressed = async () => {
    if (!email.value || !password.value) {
      //showToast();
      Alert.alert('Error', 'Por favor, ingrese su email y contraseña.'); 
      return;
    }

    try {
      console.log("Conectado a internet", isConnected);
      if (!isConnected) {
        const userId = userData ? userData.id_usuario : null;
        const usersDB = await databaseContext.executeSql(users.getUserById, [userId]);
        console.log('ID', usersDB);
        // Si no hay conexión a internet, usar los datos locales para verificar el inicio de sesión
        if (usersDB.length > 0) {
          setIsAuthenticated(true);
          Alert.alert('Éxito', 'Inicio de sesión exitoso sin conexión.');
        } else {
          console.log('Usuario no encontrado en la base de datos local');
          Alert.alert('Error', 'Usuario no encontrado en la base de datos local.');
          //showToast();
          return;
        }
      } else {
        // Si hay conexión a internet, realizar la solicitud HTTP para iniciar sesión
        const response = await userService.login(email.value, password.value);

        if (response && response.user && response.user.estado_usuario === 'A') {
          setIsAuthenticated(true);
          await AsyncStorage.setItem('userData', JSON.stringify(response.user));
          console.log(response.user.id_usuario);
          const usersHttpDB = await databaseContext.executeSql(users.getUserById, [response.user.id_usuario]);

          if (usersHttpDB.length > 0) {
            console.log('El usuario ya existe en la base de datos local.');
            Alert.alert('Éxito', 'Inicio de sesión exitoso con conexión.');
          } else {
            console.log('El usuario no existe en la base de datos local. Se procederá a insertarlo.');
            await insertUserToDatabase(response.user);
            Alert.alert('Éxito', 'Inicio de sesión exitoso y usuario insertado en la base de datos local.');
          }

        } else {
          console.log('Inicio de sesión fallido');
          //showToast();
          Alert.alert('Error', 'Inicio de sesión fallido.');
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', `Error al iniciar sesión: ${error.message}`);
    }
  };

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
