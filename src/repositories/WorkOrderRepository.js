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
// Ver DevSyncPanel.jsx: el import "default" de expo-file-system en SDK 54+ cambió a las
// clases File/Directory; documentDirectory/writeAsStringAsync/etc. siguen existiendo,
// pero solo en el subpath /legacy.
import * as FileSystem from 'expo-file-system/legacy';
import { useDatabase } from '@context/DatabaseContext';
import * as SyncQueue from '@sync/SyncQueue';
import SyncManager from '@sync/SyncManager';

const EQUIPMENT_LOCATION_DIR = `${FileSystem.documentDirectory}equipment_location/`;
const WORK_ORDER_PHOTOS_DIR = `${FileSystem.documentDirectory}work_order_photos/`;
const TICKET_SIGNATURES_DIR = `${FileSystem.documentDirectory}ticket_signatures/`;

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
     * @param {number} idOrdenTrabajo
     * @returns {Promise<object|null>}
     */
    const getLocalEquipmentLocationImage = async (idOrdenTrabajo) => {
        return getFirstAsyncSql(
            `SELECT * FROM equipment_location_images WHERE id_orden_trabajo = ?`,
            [Number(idOrdenTrabajo)]
        );
    };

    /**
     * Hidrata la caché local con la imagen de ubicación ya guardada en el servidor —
     * solo para la primera vez que se abre esta OT en este dispositivo (ver
     * useEquipmentLocationImage: si ya hay algo local, sea 'synced' o 'pending', nunca se
     * llama a esto ni se pisa). Descarga el archivo real, no solo la URL, para que quede
     * disponible offline de ahí en más.
     *
     * @param {number} taskId
     * @param {number} idOrdenTrabajo
     * @param {{ tipo_equipo?: string, comentario_imagen?: string, image_url: string }} serverData
     * @returns {Promise<object|null>}
     */
    const cacheEquipmentLocationImageFromServer = async (taskId, idOrdenTrabajo, serverData) => {
        taskId = Number(taskId);
        idOrdenTrabajo = Number(idOrdenTrabajo);

        const existing = await getLocalEquipmentLocationImage(idOrdenTrabajo);
        if (existing) {
            return existing;
        }

        await FileSystem.makeDirectoryAsync(EQUIPMENT_LOCATION_DIR, { intermediates: true }).catch(() => {});
        const localPath = `${EQUIPMENT_LOCATION_DIR}${idOrdenTrabajo}.jpg`;
        await FileSystem.downloadAsync(serverData.image_url, localPath);

        const now = new Date().toISOString();
        await executeSql(
            `INSERT INTO equipment_location_images (id_orden_trabajo, id_tarea, tipo_equipo, comentario_imagen, local_image_path, remote_image_url, sync_status, last_synced_at)
             VALUES (?, ?, ?, ?, ?, ?, 'synced', ?)`,
            [idOrdenTrabajo, taskId, serverData.tipo_equipo ?? null, serverData.comentario_imagen ?? null, localPath, serverData.image_url, now]
        );

        return getLocalEquipmentLocationImage(idOrdenTrabajo);
    };

    /**
     * Guarda la imagen de ubicación (tab "Ubicación") de forma offline-first (SPEC.md §32:
     * el archivo no debe depender de que haya Internet en el momento de capturarlo).
     * Escribe el archivo local YA (expo-file-system) y el registro en SQLite, y encola una
     * operación 'location' — SyncManager lee el archivo, arma el base64 y lo manda a POST
     * /img-location-installation-ot cuando hay conexión.
     *
     * @param {number} taskId
     * @param {number} idOrdenTrabajo
     * @param {{ userId: number, image: string, equipmentType?: string, comment?: string }} params
     *   `image` es el base64 (PNG) capturado del lienzo.
     * @returns {Promise<{ operationId: string }>}
     */
    const saveEquipmentLocationImage = async (taskId, idOrdenTrabajo, { userId, image, equipmentType, comment }) => {
        taskId = Number(taskId);
        idOrdenTrabajo = Number(idOrdenTrabajo);

        await FileSystem.makeDirectoryAsync(EQUIPMENT_LOCATION_DIR, { intermediates: true }).catch(() => {});
        const localPath = `${EQUIPMENT_LOCATION_DIR}${idOrdenTrabajo}.jpg`;
        await FileSystem.writeAsStringAsync(localPath, image, { encoding: FileSystem.EncodingType.Base64 });

        const existing = await getLocalEquipmentLocationImage(idOrdenTrabajo);
        if (existing) {
            await executeSql(
                `UPDATE equipment_location_images SET tipo_equipo = ?, comentario_imagen = ?, local_image_path = ?, sync_status = 'pending' WHERE id_orden_trabajo = ?`,
                [equipmentType ?? null, comment ?? null, localPath, idOrdenTrabajo]
            );
        } else {
            await executeSql(
                `INSERT INTO equipment_location_images (id_orden_trabajo, id_tarea, tipo_equipo, comentario_imagen, local_image_path, sync_status)
                 VALUES (?, ?, ?, ?, ?, 'pending')`,
                [idOrdenTrabajo, taskId, equipmentType ?? null, comment ?? null, localPath]
            );
        }

        const operationId = Crypto.randomUUID();
        await SyncQueue.enqueue(executeSql, {
            operationId,
            entity: 'work_orders',
            entityId: idOrdenTrabajo,
            action: 'location',
            payload: {
                id_tarea: taskId,
                id_orden_trabajo: idOrdenTrabajo,
                usuario_creacion: userId,
                tipo_equipo: equipmentType ?? null,
                comentario_imagen: comment ?? null,
                // El base64 NO viaja acá (infla la cola local): SyncManager lee este
                // archivo recién al momento de sincronizar.
                local_image_path: localPath,
            },
            expectedVersion: null,
        });

        SyncManager.requestSync();

        return { operationId };
    };

    /**
     * @param {number} idOrdenTrabajo
     * @returns {Promise<Array<object>>} Filas activas (deleted_at IS NULL), tanto ya
     *   sincronizadas como con cambios locales todavía pendientes de subir/borrar.
     */
    const getLocalPhotos = async (idOrdenTrabajo) => {
        return (await getAllAsyncSql(
            `SELECT * FROM work_order_photos WHERE id_orden_trabajo = ? AND deleted_at IS NULL ORDER BY id ASC`,
            [Number(idOrdenTrabajo)]
        )) || [];
    };

    /**
     * Agrega una foto (tab "Fotos") de forma offline-first (SPEC.md §32). La URI que
     * entrega el picker/cámara es un archivo temporal sin garantía de sobrevivir más
     * allá de esta sesión — se copia a almacenamiento propio de la app antes de
     * registrar nada, para que quede disponible aunque se cierre la app antes de
     * sincronizar. Encola una operación 'photo_upload' por foto (no un batch): así cada
     * subida es una unidad de idempotencia propia, y borrar una foto individual más
     * tarde (ver removeLocalPhoto) puede cancelar solo SU operación sin afectar a otras.
     *
     * @param {number} taskId
     * @param {number} idOrdenTrabajo
     * @param {number} clienteId
     * @param {'reception'|'delivery'} section
     * @param {string} pickedUri URI local del picker/cámara (file:// o content://).
     * @returns {Promise<object>} La fila local recién creada.
     */
    const addLocalPhoto = async (taskId, idOrdenTrabajo, clienteId, section, pickedUri) => {
        taskId = Number(taskId);
        idOrdenTrabajo = Number(idOrdenTrabajo);
        clienteId = Number(clienteId);

        await FileSystem.makeDirectoryAsync(WORK_ORDER_PHOTOS_DIR, { intermediates: true }).catch(() => {});
        const localPath = `${WORK_ORDER_PHOTOS_DIR}${idOrdenTrabajo}-${section}-${Crypto.randomUUID()}.jpg`;
        await FileSystem.copyAsync({ from: pickedUri, to: localPath });

        const insertResult = await executeSql(
            `INSERT INTO work_order_photos (id_orden_trabajo, id_tarea, cliente_id, section, local_path, sync_status) VALUES (?, ?, ?, ?, ?, 'pending')`,
            [idOrdenTrabajo, taskId, clienteId, section, localPath]
        );
        const localId = insertResult?.lastInsertRowId;

        const operationId = Crypto.randomUUID();
        await SyncQueue.enqueue(executeSql, {
            operationId,
            entity: 'work_order_photos',
            entityId: localId,
            action: 'photo_upload',
            payload: {
                id_orden_trabajo: idOrdenTrabajo,
                id_tarea: taskId,
                cliente_id: clienteId,
                section,
                local_id: localId,
                // El binario NO viaja acá (infla la cola local): SyncManager lee este
                // archivo recién al momento de sincronizar.
                local_path: localPath,
            },
            expectedVersion: null,
        });

        SyncManager.requestSync();

        return getFirstAsyncSql(`SELECT * FROM work_order_photos WHERE id = ?`, [localId]);
    };

    /**
     * Quita una foto ya persistida localmente (id local, no el uri efímero del picker).
     * Si todavía no se subió (sin remote_id), se borra local YA y de paso se cancela
     * cualquier operación 'photo_upload' todavía en cola para esa fila — si no, se
     * subiría una foto que el usuario ya sacó antes de que le tocara el turno. Si ya
     * estaba subida, se marca como tombstone (deleted_at, SPEC.md §13: no desaparece de
     * inmediato del registro de sincronización) y se encola 'photo_delete'.
     *
     * @param {number} localId
     */
    const removeLocalPhoto = async (localId) => {
        const photo = await getFirstAsyncSql(`SELECT * FROM work_order_photos WHERE id = ?`, [localId]);
        if (!photo) {
            return;
        }

        if (!photo.remote_id) {
            await SyncQueue.removeByEntity(executeSql, { entity: 'work_order_photos', entityId: localId, action: 'photo_upload' });
            await executeSql(`DELETE FROM work_order_photos WHERE id = ?`, [localId]);
            return;
        }

        const operationId = Crypto.randomUUID();
        await executeSql(
            `UPDATE work_order_photos SET deleted_at = ?, sync_status = 'pending' WHERE id = ?`,
            [new Date().toISOString(), localId]
        );
        await SyncQueue.enqueue(executeSql, {
            operationId,
            entity: 'work_order_photos',
            entityId: localId,
            action: 'photo_delete',
            payload: { remote_id: photo.remote_id },
            expectedVersion: null,
        });

        SyncManager.requestSync();
    };

    /**
     * Hidrata la caché local con la evidencia ya guardada en el servidor — solo cuando
     * no hay nada local todavía para esta OT (primera vez en este dispositivo). Descarga
     * cada imagen (vía el proxy de lectura; S3 es privado) para que quede disponible
     * offline de ahí en más.
     *
     * @param {number} taskId
     * @param {number} idOrdenTrabajo
     * @param {number} clienteId
     * @param {{ANTES?: Array<{id_evidencia: number, url: string}>, DESPUES?: Array<{id_evidencia: number, url: string}>}} grouped
     */
    const cachePhotosFromServer = async (taskId, idOrdenTrabajo, clienteId, grouped) => {
        taskId = Number(taskId);
        idOrdenTrabajo = Number(idOrdenTrabajo);
        clienteId = Number(clienteId);

        const sectionByTipo = { ANTES: 'reception', DESPUES: 'delivery' };
        await FileSystem.makeDirectoryAsync(WORK_ORDER_PHOTOS_DIR, { intermediates: true }).catch(() => {});

        for (const [tipo, section] of Object.entries(sectionByTipo)) {
            for (const item of grouped[tipo] || []) {
                const localPath = `${WORK_ORDER_PHOTOS_DIR}${idOrdenTrabajo}-${section}-${item.id_evidencia}.jpg`;
                try {
                    await FileSystem.downloadAsync(item.url, localPath);
                } catch (error) {
                    // Una descarga fallida (p.ej. proxy momentáneamente caído) no debe
                    // impedir cachear el resto de las fotos.
                    console.error(`Error al descargar la foto de evidencia ${item.id_evidencia}:`, error);
                    continue;
                }

                await executeSql(
                    `INSERT INTO work_order_photos (id_orden_trabajo, id_tarea, cliente_id, section, local_path, remote_id, remote_url, sync_status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, 'synced')`,
                    [idOrdenTrabajo, taskId, clienteId, section, localPath, item.id_evidencia, item.url]
                );
            }
        }
    };

    /**
     * Cierra el ticket de forma offline-first: la firma del cliente (tab de firma) y los
     * dos comentarios finales (modal de comentarios) escriben local YA (funciona sin
     * conexión) y encolan UNA operación 'complete_ticket' que SyncManager manda a POST
     * /tasks/{id}/client-signature (mismo endpoint que ya usaba este flujo online) en
     * cuanto hay conexión. Es el paso más sensible de todo el offline-first: finaliza el
     * ticket y dispara el correo a Monitoreo — por eso, además del operation_id de
     * siempre, el backend valida contra su propio ledger de idempotencia (ver
     * WorkOrdersController::storeTicketClientSignature).
     *
     * @param {number} taskId
     * @param {Array<number>} activeWorkOrderIds OT activas que se están firmando/cerrando.
     * @param {{
     *   userId: number, clienteId: number,
     *   nombreFirmaCliente: (string|null), tipoFirma: string, image: (string|null),
     *   comentarioCliente: (string|null), comentarioFinalTecnico: (string|null)
     * }} params `image` es el base64 (PNG) del lienzo, o null en modo "escrita".
     * @returns {Promise<{ operationId: string }>}
     */
    const completeTicket = async (taskId, activeWorkOrderIds, params) => {
        taskId = Number(taskId);
        const workOrderIds = activeWorkOrderIds.map(Number);
        const {
            userId, clienteId, nombreFirmaCliente, tipoFirma, image,
            comentarioCliente, comentarioFinalTecnico,
        } = params;

        let localImagePath = null;
        if (image) {
            await FileSystem.makeDirectoryAsync(TICKET_SIGNATURES_DIR, { intermediates: true }).catch(() => {});
            localImagePath = `${TICKET_SIGNATURES_DIR}${taskId}-${Date.now()}.jpg`;
            await FileSystem.writeAsStringAsync(localImagePath, image, { encoding: FileSystem.EncodingType.Base64 });
        }

        const now = new Date().toISOString();
        for (const idOrdenTrabajo of workOrderIds) {
            // 'units' es de donde TicketDetailScreen lee el progreso de cada OT
            // (getActiveWorkOrders) — sin actualizarla también, la pantalla seguiría
            // mostrando la OT como activa aunque ya se haya firmado/cerrado offline.
            await executeSql(
                `UPDATE units SET progreso_orden_trabajo = 'C' WHERE id_orden_trabajo = ?`,
                [idOrdenTrabajo]
            );
            await executeSql(
                `UPDATE work_orders SET progreso_orden_trabajo = 'C', fin_orden_trabajo = ?, sync_status = 'pending' WHERE id_orden_trabajo = ?`,
                [now, idOrdenTrabajo]
            );
        }

        // La firma es la finalización de TODO el ticket, no solo de estas OT: TicketDetailScreen
        // solo deja llegar hasta acá cuando ya no quedan OT activas con tabs incompletos (ver
        // handleSignatureSubmit), así que completar las OT activas SIEMPRE completa la tarea —
        // mismo criterio que el backend (WorkOrdersController::completeSingleWorkOrder, que
        // marca progreso_tarea='C' apenas orden_completada alcanza orden_requerida). Sin esto,
        // el ticket seguía apareciendo bajo la pestaña "Iniciados" (que filtra por
        // task.progreso_tarea local) hasta el próximo fetch online que trajera el estado real.
        await executeSql(
            `UPDATE task SET comentario_cliente = ?, comentario_final_tecnico = ?, progreso_tarea = 'C', fecha_fin_tarea = ?, orden_completada = COALESCE(orden_requerida, orden_completada) WHERE id_tarea = ?`,
            [comentarioCliente, comentarioFinalTecnico, now, taskId]
        );

        const operationId = Crypto.randomUUID();
        await SyncQueue.enqueue(executeSql, {
            operationId,
            entity: 'tasks',
            entityId: taskId,
            action: 'complete_ticket',
            payload: {
                id_tarea: taskId,
                id_usuario: userId,
                id_cliente: clienteId,
                nombre_firma_cliente: nombreFirmaCliente,
                tipo_firma: tipoFirma,
                comentario_cliente: comentarioCliente,
                comentario_final_tecnico: comentarioFinalTecnico,
                work_order_ids: workOrderIds,
                // El base64 NO viaja acá (infla la cola local); SyncManager lee este
                // archivo recién al momento de sincronizar (mismo criterio que 'location'/'photo_upload').
                local_image_path: localImagePath,
            },
            expectedVersion: null,
        });

        SyncManager.requestSync();

        return { operationId };
    };

    /**
     * Marca como iniciada una OT (y, si es la primera en progreso de su tarea, también
     * inicia la tarea/ticket) de forma offline-first. El ticket "se da por iniciado"
     * cuando el técnico completa el PRIMER tab de cualquiera de sus OT (lo dispara
     * FormCompletionTracker.markFormAsCompleted) — hasta ahora ese paso pegaba directo a
     * la API (FormCompletionTracker.startWorkOrder) y no funcionaba sin conexión. Escribe
     * local YA con el mismo criterio 'I' que aplica el backend
     * (WorkOrdersController::startTaskAndWorkOrder: si no hay otra OT de la tarea ya en
     * 'I'/'C'/'R', la tarea también se marca iniciada) y encola una operación 'start' que
     * SyncManager manda a POST /api/work-orders/{id}/start en cuanto hay conexión.
     *
     * @param {number} taskId
     * @param {number} idOrdenTrabajo
     * @param {{ userId: number, clienteId: number }} params
     * @returns {Promise<{ operationId: (string|null) }>} `operationId` es null si la OT
     *   ya estaba iniciada (o más allá) localmente y no había nada que hacer.
     */
    const startWorkOrder = async (taskId, idOrdenTrabajo, { userId, clienteId }) => {
        taskId = Number(taskId);
        idOrdenTrabajo = Number(idOrdenTrabajo);

        const current = await getLocalById(idOrdenTrabajo);
        if (!current) {
            throw new Error(`No existe la orden de trabajo ${idOrdenTrabajo} en la base local`);
        }

        // Ya iniciada (o completada/revisada) localmente: no repetir el efecto ni
        // encolar de nuevo. FormCompletionTracker solo llama a esto una vez por diseño
        // (al completar el primer tab), pero un dispositivo que reintenta el guardado de
        // ese primer tab offline podría volver a pasar por acá.
        if (current.progreso_orden_trabajo && current.progreso_orden_trabajo !== 'P') {
            return { operationId: null };
        }

        const now = new Date().toISOString();

        // Mismo criterio que WorkOrdersController::startTaskAndWorkOrder: si esta es la
        // única OT de la tarea en progreso, la tarea (ticket) también se da por iniciada.
        const inProgressCount = await getFirstAsyncSql(
            `SELECT COUNT(*) as count FROM work_orders WHERE id_tarea = ? AND progreso_orden_trabajo IN ('I','C','R')`,
            [taskId]
        );
        if ((inProgressCount?.count ?? 0) === 0) {
            await executeSql(
                `UPDATE task SET progreso_tarea = 'I', fecha_inicio_tarea = ? WHERE id_tarea = ?`,
                [now, taskId]
            );
        }

        await executeSql(
            `UPDATE work_orders SET progreso_orden_trabajo = 'I', inicio_orden_trabajo = ?, sync_status = 'pending' WHERE id_orden_trabajo = ?`,
            [now, idOrdenTrabajo]
        );
        // 'units' es de donde TicketDetailScreen lee el progreso de cada OT
        // (getActiveWorkOrders) — sin actualizarla también, la pantalla seguiría
        // mostrando la OT como "programada" aunque ya se haya iniciado offline.
        await executeSql(
            `UPDATE units SET progreso_orden_trabajo = 'I' WHERE id_orden_trabajo = ?`,
            [idOrdenTrabajo]
        );

        const operationId = Crypto.randomUUID();
        await SyncQueue.enqueue(executeSql, {
            operationId,
            entity: 'work_orders',
            entityId: idOrdenTrabajo,
            action: 'start',
            payload: { id_tarea: taskId, id_orden_trabajo: idOrdenTrabajo, id_usuario: userId, id_cliente: clienteId },
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
        getLocalEquipmentLocationImage,
        cacheEquipmentLocationImageFromServer,
        saveEquipmentLocationImage,
        getLocalPhotos,
        addLocalPhoto,
        removeLocalPhoto,
        cachePhotosFromServer,
        completeTicket,
        startWorkOrder,
        updateStatus,
    };
};

export default WorkOrderRepository;
