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

    /**
     * Pega a /api/img-location-installation-ot (InstallationImgWorkOrderController::store)
     * con el base64 de la imagen de ubicación ya leído del archivo local (ver SyncManager,
     * acción 'location'). Upsert simple por id_orden_trabajo, sin control de versión.
     * OJO: esta respuesta usa App\Http\Responses\ApiResponse — {success, data, error},
     * sin un código HTTP numérico explícito en el body.
     * @param {{operation_id: string, id_tarea: number, id_orden_trabajo: number, usuario_creacion: number, tipo_equipo: (string|null), comentario_imagen: (string|null), image: string}} payload
     * @returns {Promise<Object>} { success, data, error, message }.
     */
    async storeEquipmentLocationImage(payload) {
        return this.api.post('img-location-installation-ot', payload);
    }

    /**
     * Pega a /api/work-orders/{id}/photos (WorkOrderRevisionPhotosController::store),
     * multipart, con UNA sola foto (no un batch, a diferencia de cómo la llama
     * TabWorkOrderPhotos online): cada foto es su propia operación de cola/idempotencia
     * (ver WorkOrderRepository.addLocalPhoto). Igual forma de respuesta que
     * storeEquipmentLocationImage — {success, data, error} sin status HTTP numérico —
     * pero acá 'data.summary[tipo].records[0]' trae el id_evidencia/url reales de la
     * foto recién guardada (agregado justo para este flujo offline-first: la subida en
     * sí no es idempotente por naturaleza — reintentarla sin este id duplicaría la foto).
     * @param {number} idOrdenTrabajo
     * @param {FormData} formData
     * @returns {Promise<Object>}
     */
    async uploadWorkOrderPhoto(idOrdenTrabajo, formData) {
        return this.api.post(`work-orders/${idOrdenTrabajo}/photos`, formData, true);
    }

    /**
     * Pega a DELETE /api/work-orders/photos/{idEvidencia} (borrado lógico). A diferencia
     * del resto de las acciones, no lleva idempotencia por operation_id: reintentar un
     * borrado ya aplicado simplemente vuelve a dar 404 "ya fue eliminada" — mismo
     * resultado final, así que ya es idempotente en efecto sin necesidad de un ledger.
     * @param {number} remoteId id_evidencia
     * @returns {Promise<Object>}
     */
    async deleteWorkOrderPhoto(remoteId) {
        return this.api.delete(`work-orders/photos/${remoteId}`);
    }

    /**
     * Pega a POST /api/tasks/{id}/client-signature (WorkOrdersController::storeTicketClientSignature):
     * firma única del cliente + comentarios finales, finaliza las OT activas de la tarea
     * y (si con eso se completan todas las requeridas) el ticket, disparando el correo a
     * Monitoreo. El paso más sensible de todo el flujo offline-first — por eso lleva
     * operation_id incluso más en serio que el resto: el backend lo valida contra su
     * propio ledger de idempotencia antes de tocar nada.
     * @param {{operation_id: string, id_tarea: number, id_usuario: number, id_cliente: number, nombre_firma_cliente: (string|null), tipo_firma: string, image: (string|null), comentario_cliente: (string|null), comentario_final_tecnico: (string|null)}} payload
     * @returns {Promise<Object>} { success, data: { work_order_ids }, error, message }.
     */
    async completeTicket(payload) {
        return this.api.post(`tasks/${payload.id_tarea}/client-signature`, payload);
    }

    /**
     * Pega a POST /api/work-orders/{id}/start (WorkOrdersController::startTaskAndWorkOrder):
     * marca la OT (y, si aplica, la tarea) como iniciada. Se dispara offline-first desde
     * WorkOrderRepository.startWorkOrder cuando el técnico completa el primer tab de la
     * OT (antes pegaba directo a la API desde FormCompletionTracker y no funcionaba sin
     * conexión). Misma forma de respuesta que storeMaterialsOrder — status/message van en
     * el nivel superior, sin envolver en {data: {...}}.
     * @param {number} idOrdenTrabajo
     * @param {{operation_id: string, id_tarea: number, id_usuario: number, id_cliente: number}} payload
     * @returns {Promise<Object>} { task, work_order, message, status, statusText }.
     */
    async startWorkOrder(idOrdenTrabajo, payload) {
        return this.api.post(`work-orders/${idOrdenTrabajo}/start`, payload);
    }
}

export { SyncService };
export default new SyncService();
