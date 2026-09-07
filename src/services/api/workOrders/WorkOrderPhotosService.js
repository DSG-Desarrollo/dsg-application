'use strict';

import Constants from 'expo-constants';
import FetchManager from '@managers/FetchManager.js';
import { appendPhotosToFormData } from '@utils/buildPhotosFormData';

const BASE_URL = Constants.expoConfig.extra.wsERPURL;

/**
 * Cliente de la API para la evidencia fotográfica (recepción/entrega) de una orden de
 * trabajo: listar lo ya guardado en S3, subir fotos nuevas y eliminar (borrado lógico)
 * una foto existente.
 *
 * El cliente HTTP se recibe por constructor (por defecto una instancia real de
 * FetchManager) en vez de crearse internamente sin posibilidad de reemplazo: así, en un
 * test unitario, se puede instanciar `new WorkOrderPhotosService(fakeApiClient)` y
 * verificar el endpoint/payload de cada método sin tocar red real. Es la plantilla a
 * seguir para el resto de servicios de recurso de esta carpeta (`services/api/**`):
 * una clase por recurso, con su propio archivo, que no depende de detalles de
 * transporte más allá de la interfaz get/post/delete de FetchManager.
 */
class WorkOrderPhotosService {
    /**
     * @param {FetchManager} [api] Cliente HTTP a usar. Por defecto, un FetchManager real
     *   apuntando a la API. Inyectable para pruebas unitarias.
     */
    constructor(api = new FetchManager(`${BASE_URL}/api`)) {
        this.api = api;
    }

    /**
     * Lista la evidencia fotográfica activa de una orden de trabajo, agrupada por tipo
     * (ANTES/DESPUES) por el propio backend. Cada foto trae la URL del proxy de lectura
     * (nunca una URL directa de S3, que es privado).
     *
     * @param {number} orderId ID de la orden de trabajo (id_orden_trabajo).
     * @param {Object} params
     * @param {number} params.clientId
     * @param {number} params.taskId
     * @returns {Promise<Object>} Respuesta de la API: { success, data: { ANTES: [], DESPUES: [] }, error }.
     */
    async list(orderId, { clientId, taskId }) {
        const query = `clientId=${encodeURIComponent(clientId)}&taskId=${encodeURIComponent(taskId)}`;
        return this.api.get(`work-orders/${orderId}/photos?${query}`);
    }

    /**
     * Elimina (borrado lógico) una foto de evidencia por su id de registro. El objeto en
     * S3 no se toca.
     *
     * @param {number} idEvidencia
     * @returns {Promise<Object>} Respuesta de la API: { success, data, error }.
     */
    async remove(idEvidencia) {
        return this.api.delete(`work-orders/photos/${idEvidencia}`);
    }

    /**
     * Sube a S3 y guarda en base de datos la evidencia fotográfica (recepción/entrega)
     * de una orden de trabajo. Envía las fotos como multipart/form-data.
     *
     * @param {number} orderId ID de la orden de trabajo (id_orden_trabajo).
     * @param {Object} params
     * @param {number} params.clientId
     * @param {number} params.taskId
     * @param {string[]} [params.receptionPhotos] URIs locales de las fotos de recepción.
     * @param {string[]} [params.deliveryPhotos] URIs locales de las fotos de entrega.
     * @returns {Promise<Object>} Respuesta de la API: { success, data, error }.
     */
    async upload(orderId, { clientId, taskId, receptionPhotos = [], deliveryPhotos = [] }) {
        const formData = new FormData();
        formData.append('clientId', String(clientId));
        formData.append('taskId', String(taskId));
        await appendPhotosToFormData(formData, 'reception_photos', receptionPhotos);
        await appendPhotosToFormData(formData, 'delivery_photos', deliveryPhotos);

        return this.api.post(`work-orders/${orderId}/photos`, formData, true);
    }
}

export { WorkOrderPhotosService };
export default new WorkOrderPhotosService();
