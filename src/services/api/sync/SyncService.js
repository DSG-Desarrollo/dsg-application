'use strict';

import Constants from 'expo-constants';
import FetchManager from '@managers/FetchManager.js';

const BASE_URL = Constants.expoConfig.extra.wsERPURL;

/**
 * Cliente de la API para el mecanismo genérico de sincronización (SPEC.md, sección 35):
 * enviar operaciones pendientes (push, idempotente) y traer cambios del servidor
 * (pull, incremental por cursor). Sigue la misma plantilla que WorkOrderPhotosService:
 * el cliente HTTP se recibe por constructor para poder inyectar uno falso en pruebas.
 */
class SyncService {
    /**
     * @param {FetchManager} [api]
     */
    constructor(api = new FetchManager(`${BASE_URL}/api`)) {
        this.api = api;
    }

    /**
     * @param {Array<{operation_id: string, entity: string, action: string, server_id: number, expected_version: number, payload: object}>} operations
     * @returns {Promise<Object>} Respuesta de la API: { success, data: { results: [...] }, error }.
     */
    async push(operations) {
        return this.api.post('sync/push', { operations });
    }

    /**
     * @param {number} cursor Último `next_cursor` almacenado localmente (0 en la primera sincronización).
     * @returns {Promise<Object>} Respuesta de la API: { success, data: { data: [...], next_cursor }, error }.
     */
    async pull(cursor) {
        return this.api.get(`sync/changes?cursor=${encodeURIComponent(cursor)}`);
    }
}

export { SyncService };
export default new SyncService();
