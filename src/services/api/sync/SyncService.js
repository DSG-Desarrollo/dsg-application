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

    /**
     * A diferencia de push() (genérico, versionado, vía /api/sync/push), esto pega
     * directo a /api/work-orders — el endpoint propio del formulario de Instalación
     * (WorkOrdersController::store), que hace upsert simple por (id_tarea,
     * id_orden_trabajo) sin control de versión. Usado por SyncManager para la acción
     * 'install' de la cola.
     * @param {{id_tarea: number, id_orden_trabajo: number, vehicle: string, installationType: string, powerOffType: string, batteryType: string}} payload
     * @returns {Promise<Object>} Respuesta cruda de WorkOrdersController::store: { data: { message, status, statusText } }.
     */
    async storeWorkOrderInstallation(payload) {
        return this.api.post('work-orders', payload);
    }

    /**
     * Pega a /api/materials-order (WorkOrdersController::storeMaterialsOrder, vía
     * sp_upsert_material_orden) con el batch completo de líneas de una OT. Usado por
     * SyncManager para la acción 'materials' de la cola.
     * OJO: a diferencia de storeWorkOrderInstallation, esta respuesta NO envuelve en
     * {data: {...}} — status/message van en el nivel superior.
     * @param {{operation_id: string, lines: Array<{id_orden_trabajo: number, id_aprovisionamiento: number, cantidad: number}>}} payload
     * @returns {Promise<Object>} Respuesta cruda de storeMaterialsOrder: { message, status, statusText, ... }.
     */
    async storeMaterialsOrder(payload) {
        return this.api.post('materials-order', payload);
    }
}

export { SyncService };
export default new SyncService();
