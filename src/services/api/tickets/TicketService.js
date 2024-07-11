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
     * Función para suspender una promesa hasta que se resuelva.
     * @param {Promise} promise - La promesa que se desea suspender.
     * @returns {Object} - Un objeto con la función read para esperar la resolución de la promesa.
     */
    getSuspender(promise) {
        let status = 'pending';
        let response;

        const suspender = promise.then(
            (res) => {
                status = 'success';
                response = res;
            },
            (err) => {
                status = 'error';
                response = err;
            }
        );

        const read = () => {
            switch (status) {
                case 'pending':
                    throw suspender;
                case 'error':
                    throw response;
                default:
                    return response;
            }
        };

        return { read };
    }

    /**
     * Obtiene los tickets de la API con los filtros especificados.
     * @param {Object} filters - Los filtros para la consulta de tickets.
     * @param {number} timeout - Tiempo de espera máximo en milisegundos.
     * @param {number} retries - Número máximo de reintentos en caso de fallo.
     * @returns {Object} - Un objeto que contiene los datos de los tickets o el mensaje de error.
     */
    async getTickets(filters, timeout = 10000, retries = 3) {
        let attempt = 0;
        while (attempt < retries) {
            try {
                const resultData = await Promise.race([
                    this.api.get('api/tasks', { params: filters }),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera excedido')), timeout))
                ]);

                // Verificar si los datos recibidos tienen la estructura esperada
                if (resultData && Array.isArray(resultData.tasks) && resultData.tasks.length > 0) {
                    //console.log(resultData.tasks);
                    return resultData.tasks; // Devolver los tickets obtenidos dentro de un objeto
                } else {
                    // Devolver un objeto que contenga el mensaje de error
                    return { error: 'La estructura de datos de la API no es la esperada o el array de tareas está vacío.' };
                }
            } catch (error) {
                this.handleHttpError(error);

                // Si hay un error, intentar nuevamente después de un breve período de tiempo
                attempt++;
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de intentar nuevamente
                } else {
                    // Devolver un objeto que contenga el mensaje de error después de todos los intentos
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
            console.log("API: ",response);
            // Verificar si la respuesta indica un estado de éxito (código 2xx)
            if (response.data.status >= 200 && response.data.status < 300) {
                return response.data; // Devolver los datos de la respuesta
            } else {
                // Si la respuesta indica un estado de error, lanzar un error apropiado
                throw new Error(`Error ${response.data.status}: ${response.data.statusText}`);
            }
        } catch (error) {
            this.handleHttpError(error);

            // Si la solicitud no pudo ser realizada (por ejemplo, problemas de red)
            if (!error.response) {
                throw new Error('Error de red. Por favor, verifica tu conexión e inténtalo de nuevo.');
            }

            // Si la respuesta tiene un mensaje de error del servidor, lo lanzamos
            if (error.response.data && error.response.data.message) {
                throw new Error(error.response.data.message);
            } else {
                // Si no, lanzamos un mensaje genérico de error
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
            // Si no hay una respuesta, puede ser un error de red
            throw new Error('Error de red. Por favor, verifica tu conexión e inténtalo de nuevo.');
        }

        // Extraer el código de estado y el mensaje del error de la respuesta
        const { status, data } = error.response;

        // Manejar los errores más comunes basados en el código de estado
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
                // Si el código de estado no está manejado, lanzar un mensaje genérico
                throw new Error('Error desconocido. Por favor, inténtalo de nuevo más tarde.');
        }
    }

}

export default TicketService;
