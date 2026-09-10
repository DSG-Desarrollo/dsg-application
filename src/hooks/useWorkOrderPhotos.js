import { useCallback, useEffect, useState } from 'react';
import useNetworkState from '@hooks/useNetworkState';
import WorkOrderRepository from '@repositories/WorkOrderRepository';
import workOrderService from '@services/api/workorder.service';

const toItem = (row) => ({
    // id LOCAL (SQLite), estable entre sesiones — no el id_evidencia (puede no existir
    // todavía si la foto está recién guardada y sin sincronizar).
    id: row.id,
    uri: row.local_path,
    remote: !!row.remote_id,
});

/**
 * Offline-first para la evidencia fotográfica (tab "Fotos"): siempre lee de SQLite
 * local (local_path apunta a un archivo real en el dispositivo — ver
 * WorkOrderRepository). Si no hay nada local todavía (primera vez que se abre esta OT
 * en este dispositivo) y hay conexión, hidrata una vez desde el servidor; si ya hay
 * algo local (sincronizado o con cambios pendientes), nunca se pisa.
 *
 * @param {number} idOrdenTrabajo
 * @param {number} taskId
 * @param {number} clienteId
 */
const useWorkOrderPhotos = (idOrdenTrabajo, taskId, clienteId) => {
    const { networkState } = useNetworkState();
    const workOrderRepository = WorkOrderRepository();
    const [photos, setPhotos] = useState({ reception: [], delivery: [] });
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            let rows = await workOrderRepository.getLocalPhotos(idOrdenTrabajo);

            if (rows.length === 0 && networkState.isConnected) {
                const response = await workOrderService.listRevisionPhotos(idOrdenTrabajo, {
                    clientId: clienteId,
                    taskId,
                });
                if (response?.success && response.data) {
                    await workOrderRepository.cachePhotosFromServer(taskId, idOrdenTrabajo, clienteId, response.data);
                    rows = await workOrderRepository.getLocalPhotos(idOrdenTrabajo);
                }
            }

            setPhotos({
                reception: rows.filter((row) => row.section === 'reception').map(toItem),
                delivery: rows.filter((row) => row.section === 'delivery').map(toItem),
            });
        } catch (error) {
            console.error('Error al cargar la evidencia fotográfica:', error);
        } finally {
            setIsLoading(false);
        }
    }, [idOrdenTrabajo, taskId, clienteId, networkState.isConnected]);

    useEffect(() => {
        load();
    }, [load]);

    return { photos, setPhotos, isLoading, refetch: load };
};

export default useWorkOrderPhotos;
