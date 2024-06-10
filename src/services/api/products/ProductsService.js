import axios from 'axios'; // Importa axios aquí
import AxiosManager from '../../../utils/AxiosManager';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig.extra.wsERPURL;

class ProductsService {
    /**
     * Crea una instancia del servicio de tickets.
     */
    constructor() {
        this.api = new AxiosManager(BASE_URL);
    }

    /**
     * Realiza una consulta GraphQL a la API con el query y los filtros especificados.
     * @param {string} query - La consulta GraphQL.
     * @param {Object} filters - Los filtros para la consulta.
     * @param {number} timeout - Tiempo de espera máximo en milisegundos.
     * @param {number} retries - Número máximo de reintentos en caso de fallo.
     * @returns {Object} - Un objeto que contiene los datos o el mensaje de error.
     */
    async graphqlQuery(query, variables = {}, timeout = 10000, retries = 3) {
        let attempt = 0;

        while (attempt < retries) {
            try {
                const queryWithVariables = {
                    query,
                    variables
                };
                console.log(queryWithVariables);

                const resultData = await Promise.race([
                    this.api.request('/graphql', 'POST', queryWithVariables),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera excedido')), timeout))
                ]);

                // Verificar si los datos recibidos tienen la estructura esperada
                const dataKey = Object.keys(resultData.data)[0];
                console.log(resultData);
                if (resultData && resultData.data && Array.isArray(resultData.data[dataKey]) && resultData.data[dataKey].length > 0) {
                    return resultData.data[dataKey]; // Devolver los datos obtenidos
                } else {
                    return { error: 'La estructura de datos de la API no es la esperada o el array de datos está vacío.' };
                }
            } catch (error) {
                attempt++;

                if (axios.isAxiosError(error)) {
                    // Manejo de errores específicos de Axios
                    if (error.response) {
                        // El servidor respondió con un código de estado que no está en el rango 2xx
                        console.error('Error de respuesta del servidor:', error.response.status, error.response.data);
                        return { error: `Error de respuesta del servidor: ${error.response.status}. ${error.response.data}` };
                    } else if (error.request) {
                        // La solicitud se realizó pero no se recibió respuesta
                        console.error('No se recibió respuesta del servidor:', error.request);
                        return { error: 'No se recibió respuesta del servidor. Por favor, inténtalo de nuevo más tarde.' };
                    } else {
                        // Algo sucedió al configurar la solicitud que provocó un error
                        console.error('Error al configurar la solicitud:', error.message);
                        return { error: `Error al configurar la solicitud: ${error.message}` };
                    }
                } else if (error.message === 'Tiempo de espera excedido') {
                    console.error('Error de tiempo de espera:', error.message);
                    return { error: 'Tiempo de espera excedido. Por favor, inténtalo de nuevo más tarde.' };
                } else {
                    // Otros errores
                    console.error('Error desconocido:', error.message);
                    return { error: `Error desconocido: ${error.message}` };
                }

                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de intentar nuevamente
                } else {
                    return { error: 'Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.' };
                }
            }
        }
    }

    /**
     * Obtiene los productos de la API con los filtros especificados.
     * @param {Object} filters - Los filtros para la consulta de productos.
     * @param {number} timeout - Tiempo de espera máximo en milisegundos.
     * @param {number} retries - Número máximo de reintentos en caso de fallo.
     * @returns {Object} - Un objeto que contiene los datos de los productos o el mensaje de error.
     */
    async getProducts(filters, timeout = 10000, retries = 3) {
        let attempt = 0;
        while (attempt < retries) {
            try {
                const query = {
                    query: `{
                    productos(
                        ${Object.entries(filters).map(([key, value]) => `${key}: "${value}"`).join(", ")}
                    ) {
                        id_producto
                        producto
                        unidad_medida
                    }
                }`
                };

                const resultData = await Promise.race([
                    this.api.post('api/graphql', query),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera excedido')), timeout))
                ]);

                // Verificar si los datos recibidos tienen la estructura esperada
                if (resultData && resultData.data && Array.isArray(resultData.data.productos) && resultData.data.productos.length > 0) {
                    return resultData.data.productos; // Devolver los productos obtenidos
                } else {
                    return { error: 'La estructura de datos de la API no es la esperada o el array de productos está vacío.' };
                }
            } catch (error) {
                attempt++;
                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de intentar nuevamente
                } else {
                    return { error: 'Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.' };
                }
            }
        }
    }

}

export default ProductsService;