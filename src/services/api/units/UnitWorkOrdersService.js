import AxiosManager from '../../../utils/AxiosManager';
import Constants from 'expo-constants';

// Obtener la URL base de la configuración de Expo
const BASE_URL = Constants.expoConfig.extra.wsERPURL;

class UnitWorkOrdersService {
    /**
     * Crea una instancia del servicio de unidades.
     */
    constructor() {
        // Inicializar la instancia de AxiosManager con la URL base
        this.api = new AxiosManager(BASE_URL);
    }

    /**
     * Obtiene las unidades mediante una solicitud GraphQL.
     * @param {string} query - La consulta GraphQL para obtener las unidades.
     * @param {number} timeout - Tiempo máximo de espera para la solicitud (en milisegundos).
     * @param {number} retries - Número de intentos de reenvío en caso de error.
     * @returns {Promise<Object>} - Promesa que se resuelve con los datos de las unidades o un error.
     */
    async getUnits(query, timeout = 10000, retries = 3) {
        let attempt = 0;
        while (attempt < retries) {
            try {
                // Realizar la solicitud GraphQL y controlar el tiempo de espera
                const resultData = await Promise.race([
                    this.api.request('/graphql', 'POST', { query }), // Solicitud GraphQL
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera excedido')), timeout)) // Control de tiempo de espera
                ]);

                // Verificar si se recibieron datos válidos
                if (resultData && resultData.data && resultData.data.units) {
                    return resultData.data.units; // Devolver los datos de las unidades
                } else {
                    return { error: 'La estructura de datos de la API no es la esperada o el array de unidades está vacío.' };
                }
            } catch (error) {
                // Manejar errores y reintentos
                attempt++;
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar antes de un nuevo intento
                } else {
                    return { error: 'Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.' };
                }
            }
        }
    }
}

export default UnitWorkOrdersService;
