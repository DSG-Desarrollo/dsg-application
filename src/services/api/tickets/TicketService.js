import AxiosManager from '../../../utils/AxiosManager';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig.extra.wsERPURL;

/**
 * Clase para manejar las llamadas a la API relacionadas con los tickets.
 */
class TicketService {
    /**
     * Crea una instancia del servicio de tickets.
     */
    constructor() {
        this.api = new AxiosManager(BASE_URL);
    }

    /**
     * Función de espera con backoff exponencial.
     * @param {number} attempt - Número de intento actual.
     * @param {number} baseDelay - Tiempo base de retraso en milisegundos.
     * @returns {Promise} - Una promesa que se resuelve después de un retraso calculado.
     */
    async exponentialBackoff(attempt, baseDelay = 1000) {
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
    async getTickets(filters, timeout = 10000, retries = 3) {
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
                this.handleHttpError(error);

                attempt++;
                if (attempt < retries) {
                    await this.exponentialBackoff(attempt);
                } else {
                    return { error: 'Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.' };
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
            const response = await this.api.request(endpoint, 'POST', formData);
            console.log("API: ", response);

            if (response.data.status >= 200 && response.data.status < 300) {
                return response.data;
            } else {
                throw new Error(`Error ${response.data.status}: ${response.data.statusText}`);
            }
        } catch (error) {
            this.handleHttpError(error);

            if (!error.response) {
                throw new Error('Error de red. Por favor, verifica tu conexión e inténtalo de nuevo.');
            }

            if (error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Error desconocido. Por favor, inténtalo de nuevo más tarde.');
            }
        }
    }

    /**
     * Método para manejar los errores devueltos por las solicitudes HTTP.
     * @param {Error} error - El error capturado durante la solicitud HTTP.
     * @throws {Error} - Lanza un error con un mensaje descriptivo del error ocurrido.
     */
    handleHttpError(error) {
        if (!error.response) {
            throw new Error('Error de red. Por favor, verifica tu conexión e inténtalo de nuevo.');
        }

        const { status, data } = error.response;

        switch (status) {
            case 400:
                throw new Error(`Error de solicitud: ${data.message || 'Datos de solicitud inválidos.'}`);
            case 401:
                throw new Error(`Error de autorización: ${data.message || 'No autorizado.'}`);
            case 403:
                throw new Error(`Acceso prohibido: ${data.message || 'No tienes permiso para acceder a este recurso.'}`);
            case 404:
                throw new Error(`Recurso no encontrado: ${data.message || 'El recurso solicitado no existe.'}`);
            case 500:
                throw new Error(`Error interno del servidor: ${data.message || 'Error en el servidor.'}`);
            default:
                throw new Error('Error desconocido. Por favor, inténtalo de nuevo más tarde.');
        }
    }
}

export default TicketService;
