'use strict';

import Constants from 'expo-constants';
import FetchManager from '@managers/FetchManager.js';
import { appendPhotosToFormData } from '@utils/buildPhotosFormData';

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
 * de una orden de trabajo. Envía las fotos como multipart/form-data, igual que el
 * endpoint legacy en PHP puro.
 *
 * @param {number} orderId ID de la orden de trabajo (id_orden_trabajo).
 * @param {Object} params
 * @param {number} params.clientId
 * @param {number} params.taskId
 * @param {string[]} [params.receptionPhotos] URIs locales de las fotos de recepción.
 * @param {string[]} [params.deliveryPhotos] URIs locales de las fotos de entrega.
 * @returns {Promise<Object>} Respuesta de la API (ApiResponse): { success, data, error }.
 */
async function uploadRevisionPhotos(orderId, { clientId, taskId, receptionPhotos = [], deliveryPhotos = [] }) {
    const formData = new FormData();
    formData.append('clientId', String(clientId));
    formData.append('taskId', String(taskId));
    await appendPhotosToFormData(formData, 'reception_photos', receptionPhotos);
    await appendPhotosToFormData(formData, 'delivery_photos', deliveryPhotos);

    return api.post(`work-orders/${orderId}/photos`, formData, true);
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

export default {
    getWorkOrdersByTaskId,
    getWorkOrdersMaterialsSummary,
    uploadRevisionPhotos,
    saveTicketClientSignature,
};