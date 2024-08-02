import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para almacenar el estado de autenticación
export const storeAuthenticationState = async (value) => {
    if (typeof value !== 'boolean') {
        throw new Error('El valor de autenticación debe ser un booleano.');
    }

    try {
        await AsyncStorage.setItem('isAuthenticated', value ? 'true' : 'false');
        // Verificar si el valor se almacenó correctamente
        const isAuthenticatedValue = await AsyncStorage.getItem('isAuthenticated');
        if (isAuthenticatedValue !== (value ? 'true' : 'false')) {
            console.warn('El valor de isAuthenticated no coincide con el valor esperado.');
        }
    } catch (error) {
        console.error('Error al almacenar el estado de autenticación:', error.message);
        throw error; // Relanzar el error para que el llamador lo maneje
    }
};

// Función para recuperar el estado de autenticación almacenado en AsyncStorage
export const getRememberSessionState = async () => {
    try {
        const value = await AsyncStorage.getItem('isAuthenticated');
        if (value === null) {
            console.warn('El estado de autenticación no está definido en AsyncStorage.');
            return false; // Devuelve false si no se encuentra el valor
        }
        return value === 'true'; // Devuelve true si el valor es 'true', false de lo contrario
    } catch (error) {
        console.error('Error al recuperar el estado de autenticación:', error.message);
        throw error; // Relanzar el error para que el llamador lo maneje
    }
};

// Función para recuperar userData del AsyncStorage
export const getUserDataFromStorage = async () => {
    try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData === null) {
            console.warn('No se encontraron datos de usuario en AsyncStorage.');
            return null; // Devuelve null si no se encuentran datos
        }
        return JSON.parse(userData); // Devuelve el objeto parseado
    } catch (error) {
        console.error('Error al recuperar userData del almacenamiento:', error.message);
        throw error; // Relanzar el error para que el llamador lo maneje
    }
};
