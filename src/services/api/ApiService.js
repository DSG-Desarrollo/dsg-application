// src/api/ApiService.js
import AxiosManager from '../../utils/AxiosManager';
import { handleHttpError } from '../../utils/httpErrorHandler';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig.extra.wsERPURL;

/**
 * Clase para manejar las llamadas a la API.
 */
class ApiService {
    constructor() {
        this.api = new AxiosManager(BASE_URL);
    }

    /**
     * Envía datos de formulario a un endpoint específico utilizando el método POST.
     *
     * @param {Object} formData - Los datos del formulario a enviar.
     * @param {string} endpoint - El endpoint al cual se enviarán los datos.
     * @returns {Promise<Object>} - La respuesta de la solicitud HTTP.
     * @throws {Error} - Lanza un error si la solicitud falla.
     */
    async sendFormData(formData, endpoint) {
        try {
            // Realiza la solicitud HTTP POST al endpoint con los datos del formulario
            const response = await this.api.request(endpoint, 'POST', formData);

            // Verifica si la respuesta indica un estado de éxito (código 2xx)
            if (response.status >= 200 && response.status < 300) {
                return response; // Devuelve los datos de la respuesta
            } else {
                // Si la respuesta indica un estado de error, lanza un error apropiado
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            //console.log(error);
            // Maneja errores HTTP utilizando el método centralizado handleHttpError
            handleHttpError(error);

        }
    }
}

export default ApiService;
