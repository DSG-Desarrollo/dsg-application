'use strict';

import Constants from 'expo-constants';
import FetchManager from '@managers/FetchManager.js';
import workOrderPhotosService from '@services/api/workOrders/WorkOrderPhotosService';

const BASE_URL = Constants.expoConfig.extra.wsERPURL;
const api = new FetchManager(`${BASE_URL}/api`);

// Listado las órdenes de trabajo asociadas a una tarea
async function getWorkOrdersByTaskId(id) {
    return api.get(`work-orders/${id}`);
}

// Obtener el registro de los materiales usados en una órden de trabajo
async function getWorkOrdersMaterialsSummary(id) {
    return api.get(`materials-order/${id}`);
}

/**
 * Sube a S3 y guarda en base de datos la evidencia fotográfica (recepción/entrega)
 * de una orden de trabajo. Delega en WorkOrderPhotosService (services/api/workOrders),
 * que concentra toda la lógica de red de la evidencia fotográfica.
 *
 * @param {number} orderId ID de la orden de trabajo (id_orden_trabajo).
 * @param {Object} params
 * @param {number} params.clientId
 * @param {number} params.taskId
 * @param {string[]} [params.receptionPhotos] URIs locales de las fotos de recepción.
 * @param {string[]} [params.deliveryPhotos] URIs locales de las fotos de entrega.
 * @returns {Promise<Object>} Respuesta de la API (ApiResponse): { success, data, error }.
 */
async function uploadRevisionPhotos(orderId, params) {
    return workOrderPhotosService.upload(orderId, params);
}

/**
 * Lista la evidencia fotográfica activa (recepción/entrega) de una orden de trabajo,
 * ya subida a S3, agrupada por tipo. Cada foto trae la URL del proxy de lectura (el
 * bucket de S3 es privado, no hay URL directa utilizable desde el cliente).
 *
 * @param {number} orderId ID de la orden de trabajo (id_orden_trabajo).
 * @param {Object} params
 * @param {number} params.clientId
 * @param {number} params.taskId
 * @returns {Promise<Object>} Respuesta de la API: { success, data: { ANTES: [], DESPUES: [] }, error }.
 */
async function listRevisionPhotos(orderId, params) {
    return workOrderPhotosService.list(orderId, params);
}

/**
 * Elimina (borrado lógico) una foto de evidencia previamente guardada.
 *
 * @param {number} idEvidencia
 * @returns {Promise<Object>} Respuesta de la API: { success, data, error }.
 */
async function removeRevisionPhoto(idEvidencia) {
    return workOrderPhotosService.remove(idEvidencia);
}

/**
 * Guarda una única firma del cliente para un ticket (tarea) y, del lado del backend,
 * finaliza de una sola vez todas las OT activas de esa tarea (y la tarea, si con ello
 * se alcanza el número de órdenes requeridas). El cliente firma una sola vez aunque el
 * ticket tenga varias OT/unidades asociadas.
 *
 * @param {number} taskId ID de la tarea (ticket).
 * @param {Object} params
 * @param {string} params.nombreFirmaCliente
 * @param {'dibujada'|'escrita'} params.tipoFirma
 * @param {string|null} [params.image] Imagen en base64 (requerida si tipoFirma es "dibujada").
 * @param {string} [params.comentarioOrden]
 * @param {number} params.idUsuario
 * @param {number} [params.idCliente]
 * @returns {Promise<Object>} Respuesta de la API (ApiResponse): { success, data, error }.
 */
async function saveTicketClientSignature(taskId, {
    nombreFirmaCliente,
    tipoFirma,
    image = null,
    comentarioOrden = null,
    idUsuario,
    idCliente = null,
}) {
    return api.post(`tasks/${taskId}/client-signature`, {
        nombre_firma_cliente: nombreFirmaCliente,
        tipo_firma: tipoFirma,
        image,
        comentario_orden: comentarioOrden,
        id_usuario: idUsuario,
        id_cliente: idCliente,
    });
}

/**
 * Obtiene la imagen de ubicación de instalación ya guardada para una orden de trabajo,
 * si existe. Se usa para recuperarla al reabrir el tab de Ubicación (modo edición).
 *
 * @param {number} orderId ID de la orden de trabajo (id_orden_trabajo).
 * @returns {Promise<Object>} Envoltorio estándar `{ success, data, error }`. `data` es
 *   `null` si no hay imagen guardada, o `{ id_imagen, tipo_equipo, comentario_imagen,
 *   image_url }` si existe.
 */
async function getEquipmentLocationImage(orderId) {
    return api.get(`img-location-installation-ot/order/${orderId}`);
}

/**
 * Guarda (crea o actualiza) la imagen de ubicación de instalación de una orden de trabajo.
 * El backend hace upsert por id_orden_trabajo: una OT solo tiene una imagen de ubicación.
 *
 * @param {number} orderId ID de la orden de trabajo (id_orden_trabajo).
 * @param {Object} params
 * @param {number} params.taskId ID de la tarea (id_tarea).
 * @param {number} params.userId ID del usuario que guarda (usuario_creacion).
 * @param {string} params.image Imagen del lienzo en base64 (PNG).
 * @param {string} [params.equipmentType] Tipo de equipo (chip) usado como base del lienzo,
 *   para poder preseleccionarlo al recuperar la imagen.
 * @param {string} [params.comment] Comentario opcional de la imagen.
 * @returns {Promise<Object>} Respuesta de la API con el registro guardado.
 */
async function saveEquipmentLocationImage(orderId, { taskId, userId, image, equipmentType = null, comment = null }) {
    return api.post('img-location-installation-ot', {
        id_tarea: taskId,
        id_orden_trabajo: orderId,
        usuario_creacion: userId,
        tipo_equipo: equipmentType,
        image,
        comentario_imagen: comment,
    });
}

export default {
    getWorkOrdersByTaskId,
    getWorkOrdersMaterialsSummary,
    uploadRevisionPhotos,
    listRevisionPhotos,
    removeRevisionPhoto,
    saveTicketClientSignature,
    getEquipmentLocationImage,
    saveEquipmentLocationImage,
};