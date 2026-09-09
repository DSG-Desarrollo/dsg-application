// WorkOrderRepository.js
// Repository real para WorkOrders (entidad piloto de la arquitectura offline-first).
// Las órdenes de trabajo siempre se originan en el servidor (nunca se crean offline),
// así que id_orden_trabajo hace de server_id y no hace falta un local_id/UUID propio
// para la entidad — el UUID solo identifica cada operación en la cola (operation_id).
//
// Misma forma de "hook factory" que TicketRepository.js: expone funciones que usan
// useDatabase() para SQLite local, sin que las pantallas toquen SQLite ni la API
// directamente (SPEC.md, sección 4).
import * as Crypto from 'expo-crypto';
import { useDatabase } from '@context/DatabaseContext';
import * as SyncQueue from '@sync/SyncQueue';
import SyncManager from '@sync/SyncManager';

const MUTABLE_FIELDS = ['progreso_orden_trabajo', 'comentario_orden'];

const WorkOrderRepository = () => {
    const { executeSql, getAllAsyncSql, getFirstAsyncSql } = useDatabase();

    /**
     * @param {{ id_tarea?: number }} [filters]
     * @returns {Promise<Array<object>>}
     */
    const getLocalList = async (filters = {}) => {
        if (filters.id_tarea) {
            return (await getAllAsyncSql(
                `SELECT * FROM work_orders WHERE id_tarea = ? AND deleted_at IS NULL`,
                [filters.id_tarea]
            )) || [];
        }

        return (await getAllAsyncSql(`SELECT * FROM work_orders WHERE deleted_at IS NULL`)) || [];
    };

    /**
     * @param {number} idOrdenTrabajo
     * @returns {Promise<object|null>}
     */
    const getLocalById = async (idOrdenTrabajo) => {
        return getFirstAsyncSql(`SELECT * FROM work_orders WHERE id_orden_trabajo = ?`, [idOrdenTrabajo]);
    };

    /**
     * Actualiza el progreso/comentario de una OT de forma optimista: escribe primero en
     * SQLite local (funciona completamente offline) y encola la operación para que
     * SyncManager la envíe cuando haya conexión (SPEC.md, sección 2 — la operación local
     * exitosa no depende de la API).
     *
     * @param {number} idOrdenTrabajo
     * @param {{ progreso_orden_trabajo?: string, comentario_orden?: string }} changes
     * @returns {Promise<{ operationId: string }>}
     */
    const updateStatus = async (idOrdenTrabajo, changes) => {
        const current = await getLocalById(idOrdenTrabajo);
        if (!current) {
            throw new Error(`No existe la orden de trabajo ${idOrdenTrabajo} en la base local`);
        }

        const payload = Object.fromEntries(
            Object.entries(changes).filter(([field]) => MUTABLE_FIELDS.includes(field))
        );
        const expectedVersion = current.version ?? 1;
        const operationId = Crypto.randomUUID();

        const setClauses = Object.keys(payload).map((field) => `${field} = ?`);
        const setValues = Object.values(payload);

        await executeSql(
            `UPDATE work_orders SET ${setClauses.join(', ')}, sync_status = 'pending' WHERE id_orden_trabajo = ?`,
            [...setValues, idOrdenTrabajo]
        );

        await SyncQueue.enqueue(executeSql, {
            operationId,
            entity: 'work_orders',
            entityId: idOrdenTrabajo,
            action: 'update',
            payload,
            expectedVersion,
        });

        // No bloquea: si no hay conexión, la operación se queda 'pending' en la cola
        // hasta que NetworkMonitor detecte que se recuperó (ver SyncContext.jsx).
        SyncManager.requestSync();

        return { operationId };
    };

    return {
        getLocalList,
        getLocalById,
        updateStatus,
    };
};

export default WorkOrderRepository;
