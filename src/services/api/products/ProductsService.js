import axios from 'axios'; // Importa axios aquí
import AxiosManager from '@utils/AxiosManager';
import Constants from 'expo-constants';
import NetworkMonitor from '@network/NetworkMonitor';

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
            // Igual criterio que TicketService.getTickets: sin conexión, ningún
            // reintento va a cambiar el resultado — cortar ya evita golpear la API
            // inútilmente en cada vuelta del backoff.
            if (!NetworkMonitor.getIsConnected()) {
                return { error: 'Sin conexión. Se usará la información guardada localmente.' };
            }

            try {
                const queryWithVariables = {
                    query,
                    variables
                };

                const requestPromise = this.api.request('graphql', 'POST', queryWithVariables);
                // Si gana el timeout, esta promesa queda "huérfana": la petición real sigue
                // viva y puede resolver/rechazar mucho después (p.ej. al reconectar WiFi),
                // sin nada que la esté esperando ya — eso se manifestaba como un rechazo de
                // promesa sin manejar. Este catch mudo evita que se propague sin tocar el
                // resultado de la carrera de abajo.
                requestPromise.catch(() => {});

                const resultData = await Promise.race([
                    requestPromise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Tiempo de espera excedido')), timeout))
                ]);

                // Verificar si los datos recibidos tienen la estructura esperada
                if (!resultData || !resultData.data) {
                    return { error: 'La estructura de datos de la API no es la esperada.' };
                }
                const dataKey = Object.keys(resultData.data)[0];
                if (resultData && resultData.data && Array.isArray(resultData.data[dataKey]) && resultData.data[dataKey].length > 0) {
                    return resultData.data[dataKey]; // Devolver los datos obtenidos
                } else {
                    return { error: 'La estructura de datos de la API no es la esperada o el array de datos está vacío.' };
                }
            } catch (error) {
                attempt++;

                // Mismo patrón que TicketService.getTickets: clasificar/loguear el error
                // en un mensaje, SIN retornar todavía — antes cada rama retornaba acá
                // mismo, así que el reintento de abajo (attempt < retries) era código
                // inalcanzable y un timeout puntual (p.ej. ngrok lento) se reportaba como
                // fallo definitivo en el primer intento en vez de reintentar como
                // prometía la firma de la función.
                let message;
                if (axios.isAxiosError(error)) {
                    // Manejo de errores específicos de Axios
                    if (error.response) {
                        // El servidor respondió con un código de estado que no está en el rango 2xx
                        console.error('Error de respuesta del servidor:', error.response.status, error.response.data);
                        message = `Error de respuesta del servidor: ${error.response.status}. ${error.response.data}`;
                    } else if (error.request) {
                        // La solicitud se realizó pero no se recibió respuesta
                        console.error('No se recibió respuesta del servidor:', error.request);
                        message = 'No se recibió respuesta del servidor. Por favor, inténtalo de nuevo más tarde.';
                    } else {
                        // Algo sucedió al configurar la solicitud que provocó un error
                        console.error('Error al configurar la solicitud:', error.message);
                        message = `Error al configurar la solicitud: ${error.message}`;
                    }
                } else if (error.message === 'Tiempo de espera excedido') {
                    console.error('Error de tiempo de espera:', error.message);
                    message = 'Tiempo de espera excedido. Por favor, inténtalo de nuevo más tarde.';
                } else {
                    // Otros errores
                    console.error('Error desconocido:', error.message);
                    message = `Error desconocido: ${error.message}`;
                }

                if (attempt < retries) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de intentar nuevamente
                } else {
                    return { error: message };
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
            if (!NetworkMonitor.getIsConnected()) {
                return { error: 'Sin conexión. Se usará la información guardada localmente.' };
            }

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

                // Lighthouse registra su ruta como /graphql (config/lighthouse.php ->
                // route.uri), NO bajo /api — 'api/graphql' siempre daba 404. Sin
                // llamador real hoy (solo graphqlQuery() se usa), pero se corrige para
                // que si se retoma no arrastre el bug.
                const resultData = await Promise.race([
                    this.api.post('graphql', query),
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