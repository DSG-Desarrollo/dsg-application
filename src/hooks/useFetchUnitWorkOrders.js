import { useState, useEffect, useCallback } from 'react';
import UnitWorkOrdersService from '../services/api/units/UnitWorkOrdersService';
import useNetworkState from './useNetworkState';

const useFetchUnitWorkOrders = (taskId) => {
    const unitWorkOrdersService = new UnitWorkOrdersService();
    const [unitsData, setUnitsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { networkState } = useNetworkState();

    const fetchUnits = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!networkState.isConnected) {
            setError('No hay conexión de red');
            setLoading(false);
            return;
        }

        try {
            const query = `
                query {
                    units(id_tarea: ${taskId}) {
                        id_orden_trabajo
                        numero_orden
                        progreso_orden_trabajo
                        id_unidad
                        id_servicio_cliente
                        unidad
                        unidad_marca
                        unidad_modelo
                        unidad_color
                    }
                }
            `;
            const unitsResponse = await unitWorkOrdersService.getUnits(query);
            setUnitsData(unitsResponse);
        } catch (error) {
            console.log('Error al obtener los datos:', error);
            setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, [taskId, networkState]);

    useEffect(() => {
        fetchUnits();
    }, [fetchUnits]);

    return { unitsData, loading, error, refetch: fetchUnits };
};

export default useFetchUnitWorkOrders;
