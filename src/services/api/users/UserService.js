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

        while (attempt < MAX_RETRIES) {
            try {
                const response = await this.api.post('api/login', {
                    email: email,
                    password: password,
                });
                //console.log(response);
                // Verificar si el inicio de sesión fue exitoso y el usuario está activo
                if (response && response.user && response.user.estado_usuario === 'A') {
                    ToastManager.showToast('Inicio de sesión exitoso'); // Muestra un toast en caso de éxito
                    return response; // Devuelve el usuario si el inicio de sesión es exitoso
                } else {
                    ToastManager.showError('Inicio de sesión fallido');
                    throw new Error('Inicio de sesión fallido'); // Lanza un error si el inicio de sesión no fue exitoso
                }
            } catch (error) {
                attempt++;
                if (attempt < MAX_RETRIES) {
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // Espera antes de intentar nuevamente
                } else {
                    const errorMessage = error.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.__';
                    ToastManager.showError(errorMessage); // Muestra un toast en caso de error
                    Alert.alert('Error', errorMessage); // Muestra un Alert en caso de error
                    throw new Error(errorMessage); // Lanza un error después de todos los intentos fallidos
                }
            }
        }
    }
}

export default UserService;
