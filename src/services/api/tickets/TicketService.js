import FetchManager from '@managers/FetchManager.js';
import Constants from 'expo-constants';
import { HTTP_CODES } from '@constants';
import { handleHttpError } from '@utils/httpErrorHandler';

const { OK } = HTTP_CODES;

const BASE_URL = Constants.expoConfig.extra.wsERPURL;

/**
 * Clase para manejar las llamadas a la API relacionadas con los tickets.
 */
class TicketService {
    /**
     * Crea una instancia del servicio de tickets.
     */
    constructor() {
        this.api = new FetchManager(BASE_URL);
        this.TIMEOUT = 10000;
        this.RETRIES = 3;
        this.EXPONENTIAL_BACKOFF_BASE_DELAY = 1000;
    }

    /**
     * Función de espera con backoff exponencial.
     * @param {number} attempt - Número de intento actual.
     * @param {number} baseDelay - Tiempo base de retraso en milisegundos.
     * @returns {Promise} - Una promesa que se resuelve después de un retraso calculado.
     */
    async exponentialBackoff(attempt, baseDelay = this.EXPONENTIAL_BACKOFF_BASE_DELAY) {
        const delay = baseDelay * Math.pow(2, attempt); // Retraso exponencial
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Obtiene los tickets de la API con los filtros especificados.
     * @param {Object} filters - Los filtros para la consulta de tickets.
     * @param {number} timeout - Tiempo de espera máximo en milisegundos.
     * @param {number} retries - Número máximo de reintentos en caso de fallo.
     * @returns {Object} - Un objeto que contiene los datos de los tickets o el mensaje de error.
     */
    async getTickets(filters, timeout = this.TIMEOUT, retries = this.RETRIES) {
        console.log("http:", filters);
        
        let attempt = 0;
        while (attempt < retries) {
            try {
                const resultData = await Promise.race([
                    this.api.post('api/tasks', filters),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera excedido')), timeout))
                ]);
                if (resultData.status === 'success') {
                    if (resultData && Array.isArray(resultData.tasks)) {
                        return resultData.tasks;
                    } 
                } else {
                    // Manejo de respuesta inesperada o errores
                    return { error: resultData.message || 'Error inesperado en la respuesta de la API.' };
                }
            } catch (error) {
                // handleHttpError siempre lanza (ver su @throws): se usa acá solo para
                // normalizar el mensaje, sin dejar que corte el loop de reintentos.
                let message;
                try {
                    handleHttpError(error);
                } catch (normalizedError) {
                    message = normalizedError.message;
                }

                attempt++;
                if (attempt < retries) {
                    await this.exponentialBackoff(attempt);
                } else {
                    return { error: message || 'Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.' };
                }
            }
        }
    }

    /**
     * Método para enviar datos a través de una solicitud POST a un endpoint de la API.
     * @param {Object} formData - Los datos que se enviarán al servidor en el cuerpo de la solicitud.
     * @param {string} endpoint - El punto final de la API al que se enviarán los datos.
     * @returns {Promise<Object>} - Una promesa que se resuelve con la respuesta del servidor.
     * @throws {Error} - Lanza un error si ocurre algún problema durante la solicitud.
     */
    async sendFormData(formData, endpoint) {
        try {
            // this.api.request() ya devuelve el body desenvuelto (no una respuesta cruda
            // con un .data anidado), así que se lee directo de response.
            const response = await this.api.request(endpoint, 'POST', formData);
            console.log("API: ", response);

            if (response.status >= OK && response.status < 300) {
                return response;
            } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            // handleHttpError siempre lanza (ver su @throws) — nada después de esta
            // línea se ejecuta nunca, igual que en ApiService.sendFormData.
            handleHttpError(error);
        }
    }
}

export default TicketService;
