import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para almacenar el estado de autenticación
export const storeAuthenticationState = async (value) => {
    try {
        if (typeof value !== 'boolean') {
            throw new Error('El valor de autenticación debe ser un booleano.');
        }
        
        await AsyncStorage.setItem('isAuthenticated', value ? 'true' : 'false');
        const isAuthenticatedValue = await AsyncStorage.getItem('isAuthenticated');
        console.log('Valor de isAuthenticated:', isAuthenticatedValue);
    } catch (error) {
        console.error('Error al almacenar el estado de autenticación:', error.message);
        // Puedes lanzar el error para que el llamador lo maneje o realizar alguna otra acción apropiada
        throw error;
    }
};

// Función para recuperar el estado de rememberSession almacenado en AsyncStorage
export const getRememberSessionState = async () => {
    try {
        const value = await AsyncStorage.getItem('isAuthenticated');
        return value === 'true'; // Devuelve true si el valor es 'true', false de lo contrario
    } catch (error) {
        console.error('Error al recuperar el estado de rememberSession:', error.message);
        // Puedes lanzar el error para que el llamador lo maneje o realizar alguna otra acción apropiada
        throw error;
    }
};

// Función para recuperar userData del AsyncStorage
export const getUserDataFromStorage = async () => {
    try {
        const userData = await AsyncStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Error al recuperar userData del almacenamiento:', error.message);
        // Puedes lanzar el error para que el llamador lo maneje o realizar alguna otra acción apropiada
        throw error;
    }
};