'use strict';

/**
 * Clase que proporciona métodos para realizar peticiones asincrónicas utilizando la API Fetch nativa.
 * Permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en una API RESTful.
 */
class FetchManager {
    /**
     * Constructor de la clase FetchManager.
     * @param {string} baseUrl - La URL base de la API.
     */
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.headers = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Expires: '0',
        };
    }

    /**
     * Configura encabezados personalizados.
     * @param {Object} customHeaders - Un objeto con los encabezados personalizados.
     */
    setCustomHeaders(customHeaders) {
        this.headers = { ...this.headers, ...customHeaders };
    }

    /**
     * Parsea la respuesta de fetch, intentando JSON y cayendo a texto si falla.
     * @param {Response} response - La respuesta de fetch.
     * @returns {Promise<any>} - Los datos parseados.
     */
    async _parseResponse(response) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            // Puede venir vacío (204, etc.)
            const text = await response.text();
            return text ? JSON.parse(text) : null;
        }
        return response.text();
    }

    /**
     * Realiza una solicitud GET a la API.
     * @param {string} endpoint - El endpoint de la API a consultar.
     * @returns {Promise<Object>} - Promesa que se resuelve con la respuesta de la solicitud.
     */
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'GET',
                headers: this.headers,
            });

            const data = await this._parseResponse(response);

            if (!response.ok) {
                const error = new Error(`Error ${response.status} en GET ${endpoint}`);
                error.response = { status: response.status, data };
                throw error;
            }

            return data;
        } catch (error) {
            this.handleError(error, 'GET', endpoint);
            throw error;
        }
    }

    /**
     * Realiza una solicitud POST a la API.
     * @param {string} endpoint - El endpoint de la API para enviar datos.
     * @param {Object|FormData} data - Datos a enviar en el cuerpo de la solicitud (puede ser JSON o FormData).
     * @param {boolean} isFormData - Indica si los datos son una instancia de FormData (opcional).
     * @returns {Promise<Object>} - Promesa que se resuelve con la respuesta de la solicitud (comportamiento
     *   equivalente a validateStatus:false de axios: nunca lanza por status HTTP, solo por errores de red).
     */
    async post(endpoint, data, isFormData = false) {
        try {
            const headers = { ...this.headers, 'Cache-Control': 'no-cache', Pragma: 'no-cache' };

            // Con FormData, el navegador debe fijar el boundary del Content-Type automáticamente,
            // así que no lo seteamos manualmente.
            if (!isFormData) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'POST',
                headers,
                body: isFormData ? data : JSON.stringify(data),
            });

            // Igual que validateStatus:false en axios: se retorna el body sin lanzar por status.
            return await this._parseResponse(response);
        } catch (error) {
            this.handleError(error, 'POST', endpoint);
            throw error;
        }
    }

    /**
     * Realiza una solicitud PUT a la API.
     * @param {string} endpoint - El endpoint de la API para actualizar datos.
     * @param {Object} data - Datos a enviar en el cuerpo de la solicitud.
     * @returns {Promise<Object>} - Promesa que se resuelve con la respuesta de la solicitud.
     */
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await this._parseResponse(response);

            if (!response.ok) {
                const error = new Error(`Error ${response.status} en PUT ${endpoint}`);
                error.response = { status: response.status, data: responseData };
                throw error;
            }

            return responseData;
        } catch (error) {
            this.handleError(error, 'PUT', endpoint);
            throw error;
        }
    }

    /**
     * Realizar una solicitud HTTP a un endpoint dado utilizando el método especificado.
     * @param {string} endpoint - El endpoint al que se enviará la solicitud.
     * @param {string} method - El método HTTP de la solicitud (POST, PUT).
     * @param {Object} data - Los datos a enviar en la solicitud.
     * @param {boolean} withCredentials - Indica si se deben incluir las credenciales en la solicitud (true o false).
     * @throws {Error} Error si el método HTTP proporcionado no es válido.
     * @throws {Error} Error si ocurre algún problema durante la solicitud.
     * @returns {Promise<Object>} Una promesa que se resuelve con los datos de la respuesta.
     */
    async request(endpoint, method, data, withCredentials) {
        const url = `${this.baseUrl}/${endpoint}`;
        const upperCaseMethod = method.toUpperCase();

        if (upperCaseMethod !== 'POST' && upperCaseMethod !== 'PUT') {
            throw new Error('Método HTTP no válido. Solo se admiten POST y PUT.');
        }

        try {
            const response = await fetch(url, {
                method: upperCaseMethod,
                headers: this.headers,
                body: JSON.stringify(data),
                // Equivalente fetch de withCredentials: axios lo maneja como booleano,
                // fetch usa 'include' | 'same-origin' | 'omit'.
                credentials: withCredentials ? 'include' : 'same-origin',
            });

            const responseData = await this._parseResponse(response);

            if (!response.ok) {
                throw new Error(`Error al realizar la solicitud ${method} a ${url}::: HTTP ${response.status}`);
            }

            return responseData;
        } catch (error) {
            throw new Error(`Error al realizar la solicitud ${method} a ${url}::: ${error.message}`);
        }
    }

    /**
     * Realiza una solicitud DELETE a la API.
     * @param {string} endpoint - El endpoint de la API para eliminar datos.
     * @returns {Promise<Object>} - Promesa que se resuelve con la respuesta de la solicitud.
     */
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'DELETE',
                headers: this.headers,
            });

            const data = await this._parseResponse(response);

            if (!response.ok) {
                const error = new Error(`Error ${response.status} en DELETE ${endpoint}`);
                error.response = { status: response.status, data };
                throw error;
            }

            return data;
        } catch (error) {
            this.handleError(error, 'DELETE', endpoint);
            throw error;
        }
    }

    /**
     * Maneja errores de solicitud HTTP.
     * @param {Error} error - El error lanzado durante la solicitud.
     * @param {string} method - El método HTTP (GET, POST, PUT, DELETE).
     * @param {string} endpoint - El endpoint de la API.
     */
    handleError(error, method, endpoint) {
        console.error(`Error en la solicitud ${method} a ${endpoint}:`, error.response ? error.response.data : error.message);
    }
}

export default FetchManager;