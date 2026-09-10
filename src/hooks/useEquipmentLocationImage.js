import { useCallback, useEffect, useState } from 'react';
import useNetworkState from '@hooks/useNetworkState';
import WorkOrderRepository from '@repositories/WorkOrderRepository';
import workOrderService from '@services/api/workorder.service';

/**
 * Offline-first para la imagen de ubicación de instalación (tab "Ubicación"): siempre
 * lee de SQLite local (la fila trae local_image_path, un archivo real en el
 * dispositivo — ver WorkOrderRepository). Si no hay nada local todavía (primera vez que
 * se abre esta OT en este dispositivo) y hay conexión, se hidrata una sola vez desde el
 * servidor; si ya hay algo local (sincronizado o con un cambio 'pending' sin subir
 * todavía), nunca se pisa.
 *
 * @param {number} idOrdenTrabajo
 * @param {number} taskId
 */
const useEquipmentLocationImage = (idOrdenTrabajo, taskId) => {
    const { networkState } = useNetworkState();
    const workOrderRepository = WorkOrderRepository();
    const [record, setRecord] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            let local = await workOrderRepository.getLocalEquipmentLocationImage(idOrdenTrabajo);

            if (!local && networkState.isConnected) {
                const response = await workOrderService.getEquipmentLocationImage(idOrdenTrabajo);
                const saved = response?.data;
                if (saved?.image_url) {
                    local = await workOrderRepository.cacheEquipmentLocationImageFromServer(taskId, idOrdenTrabajo, saved);
                }
            }

            setRecord(local);
        } catch (error) {
            console.error('Error al cargar la imagen de ubicación:', error);
        } finally {
            setIsLoading(false);
        }
    }, [idOrdenTrabajo, taskId, networkState.isConnected]);

    useEffect(() => {
        load();
    }, [load]);

    return { record, isLoading, refetch: load };
};

export default useEquipmentLocationImage;
