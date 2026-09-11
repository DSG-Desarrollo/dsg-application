import { useState, useEffect, useCallback } from 'react';
import UnitWorkOrdersService from '@services/api/units/UnitWorkOrdersService';
import useNetworkState from '@hooks/useNetworkState';
import { useDatabase } from '@context/DatabaseContext';
import WorkOrderRepository from '@repositories/WorkOrderRepository';

// Columnas cacheadas localmente por cada unidad (id_tarea no viene en la
// respuesta del backend — UnitsQuery la recibe como parámetro pero no la
// devuelve en cada fila — así que la agregamos nosotros antes de guardar,
// para poder filtrar por ticket al leer offline).
const UNIT_COLUMNS = [
    'id_tarea', 'id_orden_trabajo', 'numero_orden', 'progreso_orden_trabajo',
    'id_unidad', 'id_servicio_cliente', 'unidad', 'unidad_marca', 'unidad_modelo', 'unidad_color',
];

const useFetchUnitWorkOrders = (taskId) => {
    const unitWorkOrdersService = new UnitWorkOrdersService();
    const [unitsData, setUnitsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { networkState } = useNetworkState();
    const { getAllAsyncSql, runExclusive } = useDatabase();
    const workOrderRepository = WorkOrderRepository();

    const fetchSavedUnits = useCallback(async () => {
        const query = `SELECT * FROM units WHERE id_tarea = ? ORDER BY id_orden_trabajo DESC`;
        return (await getAllAsyncSql(query, [taskId])) || [];
    }, [taskId, getAllAsyncSql]);

    // work_orders.sync_status='pending' es la fuente de verdad de "hay un cambio local
    // (start/complete_ticket/etc.) todavía no confirmado por el servidor" — mismo criterio
    // que ya usa WorkOrderRepository.seedFromUnits (nunca pisa esas filas) y
    // SyncManager._applyChanges (AND sync_status != 'pending'). La respuesta remota de
    // `units` no sabe nada de esto: sin este merge, cada refetch online pisaba el color
    // recién actualizado localmente con el estado viejo del servidor hasta que el push en
    // background (fire-and-forget, ver SyncManager.requestSync) terminara de confirmarse.
    const applyPendingLocalOverrides = useCallback(async (units) => {
        if (!Array.isArray(units) || units.length === 0) return units;
        const pendingRows = await getAllAsyncSql(
            `SELECT id_orden_trabajo, progreso_orden_trabajo FROM work_orders WHERE id_tarea = ? AND sync_status = 'pending'`,
            [taskId]
        ) || [];
        if (pendingRows.length === 0) return units;

        const pendingProgressById = new Map(
            pendingRows.map((row) => [Number(row.id_orden_trabajo), row.progreso_orden_trabajo])
        );
        return units.map((unit) => {
            const pendingProgress = pendingProgressById.get(Number(unit.id_orden_trabajo));
            return pendingProgress != null
                ? { ...unit, progreso_orden_trabajo: pendingProgress }
                : unit;
        });
    }, [taskId, getAllAsyncSql]);

    // id_orden_trabajo es la clave de negocio de cada fila (una OT por unidad
    // asignada a este ticket); se usa para decidir INSERT vs UPDATE, igual
    // que upsertDataIntoTable en useSaveToSQLite.js para Tickets.
    const saveUnitsLocally = useCallback(async (units) => {
        if (!Array.isArray(units) || units.length === 0) return;
        try {
            await runExclusive(async (db) => {
                for (const unit of units) {
                    const values = UNIT_COLUMNS.map((col) => (col === 'id_tarea' ? taskId : unit[col] ?? null));
                    const existing = await db.getAllRows(
                        'SELECT id FROM units WHERE id_orden_trabajo = ?',
                        [unit.id_orden_trabajo]
                    );
                    if (existing.length === 0) {
                        await db.executeSql(
                            `INSERT INTO units (${UNIT_COLUMNS.join(', ')}) VALUES (${UNIT_COLUMNS.map(() => '?').join(', ')})`,
                            values
                        );
                    } else {
                        const setClause = UNIT_COLUMNS.map((col) => `${col} = ?`).join(', ');
                        await db.executeSql(
                            `UPDATE units SET ${setClause} WHERE id_orden_trabajo = ?`,
                            [...values, unit.id_orden_trabajo]
                        );
                    }
                }
            });
        } catch (error) {
            console.error('Error al guardar unidades en SQLite:', error);
        }
    }, [taskId, runExclusive]);

    const fetchUnits = useCallback(async () => {
        setLoading(true);
        setError(null);

        if (!networkState.isConnected) {
            // Antes esta rama solo seteaba un error y devolvía unitsData vacío —
            // no había ningún camino offline. Ahora leemos lo que se haya
            // cacheado en un fetch online anterior para este mismo ticket.
            try {
                setUnitsData(await fetchSavedUnits());
            } catch (error) {
                console.error('Error al leer unidades guardadas:', error);
                setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
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
            if (Array.isArray(unitsResponse)) {
                // Antes de mostrar/cachear la respuesta remota, no pisar el progreso de
                // ninguna OT que todavía tenga una operación local sin confirmar.
                let mergedUnits = unitsResponse;
                try {
                    mergedUnits = await applyPendingLocalOverrides(unitsResponse);
                } catch (mergeError) {
                    console.error('Error al aplicar overrides locales pendientes:', mergeError);
                }

                setUnitsData(mergedUnits);
                // No deben tirar la pantalla abajo si algo falla al cachear: ya tenemos
                // los datos frescos de la red para mostrar. Antes se llamaban sin await
                // ni catch — un fallo acá se volvía una promesa rechazada sin manejar.
                try {
                    await saveUnitsLocally(mergedUnits);
                } catch (cacheError) {
                    console.error('Error al cachear unidades en SQLite:', cacheError);
                }
                try {
                    await workOrderRepository.seedFromUnits(taskId, unitsResponse);
                } catch (cacheError) {
                    console.error('Error al sembrar work_orders desde unidades:', cacheError);
                }
            } else {
                setError(unitsResponse?.error || 'Error al obtener los datos.');
            }
        } catch (error) {
            console.log('Error al obtener los datos:', error);
            setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    }, [taskId, networkState, fetchSavedUnits, saveUnitsLocally, applyPendingLocalOverrides]);

    useEffect(() => {
        fetchUnits();
    }, [fetchUnits]);

    return { unitsData, loading, error, refetch: fetchUnits };
};

export default useFetchUnitWorkOrders;
