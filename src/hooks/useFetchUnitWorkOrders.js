import { useState, useEffect } from 'react';
import UnitWorkOrdersService from '../services/api/units/UnitWorkOrdersService';
import useNetworkState from './useNetworkState';

const useFetchUnitWorkOrders = (taskId) => {
    //console.log(taskId);
    const unitWorkOrdersService = new UnitWorkOrdersService();
    const [unitsData, setUnitsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { networkState } = useNetworkState();

    useEffect(() => {
        const fetchUnits = async () => {
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
                setLoading(false);
            } catch (error) {
                console.log('Error al obtener los datos:', error);
                setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.');
                setLoading(false);
            }
        };

        fetchUnits();
    }, [taskId, networkState]);

    return { unitsData, loading, error };
}

export default useFetchUnitWorkOrders;
