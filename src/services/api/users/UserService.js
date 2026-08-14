import AxiosManager from '../../../utils/AxiosManager';
import Constants from 'expo-constants';
import ToastManager from '../../../utils/ToastManager';

const BASE_URL = Constants.expoConfig.extra.wsERPURL;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 segundos de espera entre reintentos

class UserService {
    /**
     * Crea una instancia del servicio de usuario.
     */
    constructor() {
        this.api = new AxiosManager(BASE_URL);
    }

    /**
     * Realiza el inicio de sesión del usuario.
     * @param {string} email - El correo electrónico del usuario.
     * @param {string} password - La contraseña del usuario.
     * @returns {Object} - Los datos del usuario si el inicio de sesión es exitoso.
     * @throws {Error} - Error si el inicio de sesión no fue exitoso después de varios intentos.
     */
    async login(email, password) {
        //console.log("Credenciales: ",email, password);
        let attempt = 0;
        let response;

        // AxiosManager.post usa validateStatus:false, así que una credencial
        // incorrecta (401) NO lanza excepción, solo llega aquí como una
        // respuesta más. Por eso los reintentos deben limitarse a fallos
        // reales de red/transporte (el catch de abajo); una respuesta
        // determinística del servidor ("Credenciales incorrectas", etc.) no
        // debe reintentarse 3 veces, se resuelve de una sola vez fuera del
        // bucle.
        while (attempt < MAX_RETRIES) {
            try {
                response = await this.api.post('api/login', {
                    email: email,
                    password: password,
                });
                break;
            } catch (error) {
                attempt++;
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // Espera antes de intentar nuevamente
                } else {
                    const errorMessage = error.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.__';
                    // La pantalla (LoginScreen) ya muestra un Alert con este
                    // mismo mensaje en su catch; no duplicarlo aquí.
                    ToastManager.showError(errorMessage);
                    throw new Error(errorMessage); // Lanza un error después de todos los intentos fallidos
                }
            }
        }

        // Verificar si el inicio de sesión fue exitoso y el usuario está activo
        if (response && response.user && response.user.estado_usuario === 'A') {
            ToastManager.showToast('Inicio de sesión exitoso'); // Muestra un toast en caso de éxito
            return response; // Devuelve el usuario si el inicio de sesión es exitoso
        }

        // El backend respondió, pero rechazó el login: usamos su mensaje
        // real (p.ej. "Credenciales incorrectas") en vez de un texto
        // genérico, para poder diagnosticar la causa real.
        console.warn('Login rechazado por el backend:', response);
        const backendMessage = (response && response.message) || 'Inicio de sesión fallido';
        // La pantalla (LoginScreen) ya muestra un Alert con este mismo
        // mensaje en su catch; no duplicarlo aquí.
        ToastManager.showError(backendMessage);
        throw new Error(backendMessage);
    }
}

export default UserService;
