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
        return getFirstAsyncSql(`SELECT * FROM work_orders WHERE id_orden_trabajo = ?`, [Number(idOrdenTrabajo)]);
    };

    /**
     * Guarda/actualiza la "cáscara" de las órdenes de trabajo de un ticket a partir de la
     * lista de unidades (única fuente hoy que trae work orders reales del servidor —
     * useFetchUnitWorkOrders la llama tras cada fetch online exitoso). Solo toca las
     * columnas que esa fuente conoce (id_tarea, numero_orden, progreso_orden_trabajo);
     * nunca pisa una fila con sync_status='pending' para no perder un cambio local
     * (p.ej. una instalación guardada offline) todavía no sincronizado.
     *
     * @param {number} taskId
     * @param {Array<{id_orden_trabajo: number, numero_orden?: number, progreso_orden_trabajo?: string}>} units
     */
    const seedFromUnits = async (taskId, units) => {
        if (!Array.isArray(units) || units.length === 0) return;

        // Normalizamos a number en el borde del repository: id_orden_trabajo llega como
        // string desde el GraphQL de unidades (tipo ID) en algunos casos y como number en
        // otros según el llamador — sin esto, sync_queue.entity_id y los payloads quedaban
        // con tipos mezclados ("10785" vs 10785) para la misma OT.
        const normalizedTaskId = Number(taskId);

        for (const unit of units) {
            if (!unit.id_orden_trabajo) continue;
            const idOrdenTrabajo = Number(unit.id_orden_trabajo);

            const existing = await getFirstAsyncSql(
                `SELECT id, sync_status FROM work_orders WHERE id_orden_trabajo = ?`,
                [idOrdenTrabajo]
            );
            const now = new Date().toISOString();

            if (!existing) {
                await executeSql(
                    `INSERT INTO work_orders (id_orden_trabajo, id_tarea, numero_orden, progreso_orden_trabajo, sync_status, last_synced_at)
                     VALUES (?, ?, ?, ?, 'synced', ?)`,
                    [idOrdenTrabajo, normalizedTaskId, unit.numero_orden ?? null, unit.progreso_orden_trabajo ?? null, now]
                );
            } else if (existing.sync_status !== 'pending') {
                await executeSql(
                    `UPDATE work_orders SET id_tarea = ?, numero_orden = ?, progreso_orden_trabajo = ?, last_synced_at = ? WHERE id_orden_trabajo = ?`,
                    [normalizedTaskId, unit.numero_orden ?? null, unit.progreso_orden_trabajo ?? null, now, idOrdenTrabajo]
                );
            }
        }
    };

    /**
     * Guarda el tipo de instalación (tab "Instalación") de forma offline-first: escribe
     * 'instalacion' en SQLite local de inmediato (funciona sin conexión) y encola una
     * operación 'install', que SyncManager manda a POST /api/work-orders (el mismo
     * endpoint que ya usaba el formulario online) en cuanto hay conexión. A diferencia de
     * updateStatus/'update', ese endpoint no tiene control de versión — hace un upsert
     * simple por (id_tarea, id_orden_trabajo) — así que no hay expected_version/conflict.
     *
     * @param {number} taskId
     * @param {number} idOrdenTrabajo
     * @param {{ vehicle: string, installationType: string, powerOffType: string, batteryType: string }} installation
     * @returns {Promise<{ operationId: string }>}
     */
    const saveInstallation = async (taskId, idOrdenTrabajo, installation) => {
        taskId = Number(taskId);
        idOrdenTrabajo = Number(idOrdenTrabajo);

        const current = await getLocalById(idOrdenTrabajo);
        if (!current) {
            // No debería pasar en el flujo normal (se llega acá navegando desde la lista
            // de unidades, que ya sembró esta fila vía seedFromUnits), pero si pasa es un
            // estado real a diagnosticar, no algo para silenciar.
            throw new Error(`No existe la orden de trabajo ${idOrdenTrabajo} en la base local`);
        }

        const { vehicle, installationType, powerOffType, batteryType } = installation;
        // Mismo formato que arma el backend (WorkOrdersController::store) para 'instalacion',
        // así una lectura posterior (getLocalById + split) no necesita distinguir si el
        // valor vino de la red o de acá.
        const instalacionValue = [vehicle, installationType, powerOffType, batteryType].join('|');
        const operationId = Crypto.randomUUID();

        await executeSql(
            `UPDATE work_orders SET instalacion = ?, sync_status = 'pending' WHERE id_orden_trabajo = ?`,
            [instalacionValue, idOrdenTrabajo]
        );

        await SyncQueue.enqueue(executeSql, {
            operationId,
            entity: 'work_orders',
            entityId: idOrdenTrabajo,
            action: 'install',
            payload: { id_tarea: taskId, id_orden_trabajo: idOrdenTrabajo, vehicle, installationType, powerOffType, batteryType },
            expectedVersion: null,
        });

        SyncManager.requestSync();

        return { operationId };
    };

    /**
     * @param {number} idOrdenTrabajo
     * @returns {Promise<Array<{id: number, cantidad: number}>>} Igual forma que
     *   sp_ordenes_trabajos_materiales_resumen (id = id_aprovisionamiento).
     */
    const getLocalMaterials = async (idOrdenTrabajo) => {
        return (await getAllAsyncSql(
            `SELECT id_aprovisionamiento AS id, cantidad FROM materials_order WHERE id_orden_trabajo = ?`,
            [Number(idOrdenTrabajo)]
        )) || [];
    };

    /**
     * Guarda las líneas de materiales de una OT (tab "Materiales") de forma offline-first.
     * A diferencia de saveInstallation (un solo campo), acá el guardado es un batch: TODAS
     * las líneas del catálogo, incluidas cantidad 0 (igual que arma hoy TabWorkOrderSupplies).
     * Local, replicamos la semántica de sp_upsert_material_orden: cantidad > 0 -> upsert por
     * (id_orden_trabajo, id_aprovisionamiento); cantidad <= 0 -> borra la línea si existía.
     * Se encola UNA sola operación 'materials' con el batch completo, que SyncManager manda
     * a POST /api/materials-order (mismo endpoint/payload que ya usaba el formulario online).
     *
     * @param {number} taskId
     * @param {number} idOrdenTrabajo
     * @param {Array<{id_aprovisionamiento: number, cantidad: number}>} lines
     * @returns {Promise<{ operationId: string }>}
     */
    const saveMaterials = async (taskId, idOrdenTrabajo, lines) => {
        taskId = Number(taskId);
        idOrdenTrabajo = Number(idOrdenTrabajo);
        // Mismo motivo que en seedFromUnits: product.id (la clave de negocio de cada
        // línea) puede llegar como string desde el catálogo GraphQL.
        const normalizedLines = lines.map(({ id_aprovisionamiento, cantidad }) => ({
            id_aprovisionamiento: Number(id_aprovisionamiento),
            cantidad: Number(cantidad),
        }));

        for (const { id_aprovisionamiento, cantidad } of normalizedLines) {
            const existing = await getFirstAsyncSql(
                `SELECT id FROM materials_order WHERE id_orden_trabajo = ? AND id_aprovisionamiento = ?`,
                [idOrdenTrabajo, id_aprovisionamiento]
            );

            if (cantidad > 0) {
                if (existing) {
                    await executeSql(
                        `UPDATE materials_order SET cantidad = ?, sync_status = 'pending' WHERE id = ?`,
                        [cantidad, existing.id]
                    );
                } else {
                    await executeSql(
                        `INSERT INTO materials_order (id_orden_trabajo, id_aprovisionamiento, cantidad, sync_status) VALUES (?, ?, ?, 'pending')`,
                        [idOrdenTrabajo, id_aprovisionamiento, cantidad]
                    );
                }
            } else if (existing) {
                await executeSql(`DELETE FROM materials_order WHERE id = ?`, [existing.id]);
            }
        }

        const operationId = Crypto.randomUUID();
        await SyncQueue.enqueue(executeSql, {
            operationId,
            entity: 'work_orders',
            entityId: idOrdenTrabajo,
            action: 'materials',
            payload: {
                lines: normalizedLines.map(({ id_aprovisionamiento, cantidad }) => ({
                    id_orden_trabajo: idOrdenTrabajo,
                    id_aprovisionamiento,
                    cantidad,
                })),
            },
            expectedVersion: null,
        });

        SyncManager.requestSync();

        return { operationId };
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
        idOrdenTrabajo = Number(idOrdenTrabajo);
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
        seedFromUnits,
        saveInstallation,
        getLocalMaterials,
        saveMaterials,
        updateStatus,
    };
};

export default WorkOrderRepository;
