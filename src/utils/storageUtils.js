import AsyncStorage from '@react-native-async-storage/async-storage';

// Función genérica para almacenar un valor en AsyncStorage
const storeItem = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== value) {
            console.warn(`El valor almacenado para la clave "${key}" no coincide con el valor esperado.`);
        }
    } catch (error) {
        console.error(`Error al almacenar ${key} en AsyncStorage:`, error.message);
        throw new Error(`No se pudo almacenar el valor para ${key}.`);
    }
};

// Función genérica para recuperar un valor de AsyncStorage
const getItem = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value === null) {
            console.warn(`El valor para la clave "${key}" no está definido en AsyncStorage.`);
            return null;
        }
        return value;
    } catch (error) {
        console.error(`Error al recuperar ${key} de AsyncStorage:`, error.message);
        throw new Error(`No se pudo recuperar el valor para ${key}.`);
    }
};

// Función para almacenar el estado de autenticación
export const storeAuthenticationState = async (isAuthenticated) => {
    if (typeof isAuthenticated !== 'boolean') {
        throw new Error('El valor de autenticación debe ser un booleano.');
    }
    await storeItem('isAuthenticated', isAuthenticated ? 'true' : 'false');
};

// Función para recuperar el estado de autenticación almacenado en AsyncStorage
export const getRememberSessionState = async () => {
    const value = await getItem('isAuthenticated');
    return value === 'true';
};

// Función para recuperar userData del AsyncStorage
export const getUserDataFromStorage = async () => {
    const userData = await getItem('userData');
    return userData ? JSON.parse(userData) : null;
};
