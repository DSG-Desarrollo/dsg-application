import AsyncStorage from '@react-native-async-storage/async-storage';

// Función para almacenar la preferencia del switch "Recordar sesión".
// OJO: esto es solo una preferencia de UI, NO implica que haya una sesión
// autenticada. Ver storeSessionActive/getSessionActive para eso.
export const storeAuthenticationState = async (value) => {
    if (typeof value !== 'boolean') {
        throw new Error('El valor de autenticación debe ser un booleano.');
    }

    try {
        await AsyncStorage.setItem('rememberSessionPreference', value ? 'true' : 'false');
        // Verificar si el valor se almacenó correctamente
        const storedValue = await AsyncStorage.getItem('rememberSessionPreference');
        if (storedValue !== (value ? 'true' : 'false')) {
            console.warn('El valor de rememberSessionPreference no coincide con el valor esperado.');
        }
    } catch (error) {
        console.error('Error al almacenar la preferencia de "recordar sesión":', error.message);
        throw error; // Relanzar el error para que el llamador lo maneje
    }
};

// Función para recuperar la preferencia del switch "Recordar sesión"
export const getRememberSessionState = async () => {
    try {
        const value = await AsyncStorage.getItem('rememberSessionPreference');
        if (value === null) {
            return false; // Devuelve false si no se encuentra el valor
        }
        return value === 'true'; // Devuelve true si el valor es 'true', false de lo contrario
    } catch (error) {
        console.error('Error al recuperar la preferencia de "recordar sesión":', error.message);
        throw error; // Relanzar el error para que el llamador lo maneje
    }
};

// Función para almacenar si hay una sesión autenticada válida y persistida.
// Solo debe escribirse tras un login exitoso (online u offline), nunca al
// tocar el switch de "Recordar sesión".
export const storeSessionActive = async (value) => {
    if (typeof value !== 'boolean') {
        throw new Error('El valor de sesión activa debe ser un booleano.');
    }

    try {
        await AsyncStorage.setItem('sessionActive', value ? 'true' : 'false');
    } catch (error) {
        console.error('Error al almacenar el estado de sesión activa:', error.message);
        throw error;
    }
};

// Función para recuperar si hay una sesión autenticada válida y persistida
export const getSessionActive = async () => {
    try {
        const value = await AsyncStorage.getItem('sessionActive');
        return value === 'true';
    } catch (error) {
        console.error('Error al recuperar el estado de sesión activa:', error.message);
        throw error;
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
