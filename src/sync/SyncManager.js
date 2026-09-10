// SyncManager.js
// Orquestador de sincronización, exportado como singleton (SPEC.md, sección 42: nunca debe
// haber más de una sincronización corriendo a la vez — de ahí el lock `isSyncing`).
// `configure()` se llama una vez al iniciar la app (ver SyncContext.jsx); a partir de
// ahí, cualquier módulo puede importar esta misma instancia y llamar `requestSync()`.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SyncQueue from './SyncQueue';
import * as ConflictResolver from './ConflictResolver';
import * as RetryPolicy from './RetryPolicy';
import * as SyncState from './SyncState';
import SyncService from '@services/api/sync/SyncService';
import NetworkMonitor from '@network/NetworkMonitor';

const CURSOR_STORAGE_KEY = 'sync_cursor_work_orders';

class SyncManager {
    constructor() {
        this.db = null;
        this.isSyncing = false;
    }

    /**
     * @param {{ db: { executeSql: Function, getAllAsyncSql: Function, runExclusive: Function } }} config
     */
    configure({ db }) {
        this.db = db;
    }

    isConfigured() {
        return !!this.db;
    }

    /**
     * Fire-and-forget: no bloquea al llamador (SPEC.md, sección 2 — una operación local exitosa
     * no depende de que la sincronización remota termine, ni siquiera de que empiece).
     */
    requestSync() {
        this.syncNow().catch((error) => {
            console.error('Error durante la sincronización:', error);
        });
    }

    async syncNow() {
        if (!this.isConfigured()) {
            return;
        }

        if (this.isSyncing) {
            return;
        }

        if (!NetworkMonitor.getIsConnected()) {
            SyncState.setState({ status: 'offline' });
            return;
        }

        this.isSyncing = true;
        SyncState.setState({ status: 'syncing' });

        try {
            await this._pushPending();
            await this._pullChanges();

            const counts = await SyncQueue.countByStatus(this.db.getAllAsyncSql);
            SyncState.setState({
                status: 'success',
                pendingCount: counts.pending,
                failedCount: counts.failed,
                failedPermanentCount: counts.failed_permanent,
                conflictCount: counts.conflict,
                lastSyncedAt: new Date().toISOString(),
                lastError: null,
            });
        } catch (error) {
            SyncState.setState({ status: 'error', lastError: error.message });
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }

    async _pushPending() {
        const pendingRows = await SyncQueue.listPending(this.db.getAllAsyncSql);
        if (pendingRows.length === 0) {
            return;
        }

        // 'update' (progreso_orden_trabajo/comentario_orden) va por el slice genérico
        // versionado (/api/sync/push, con expected_version/conflict). 'install' (tab
        // Instalación) pega directo a /api/work-orders, que no tiene ese control de
        // versión — cada acción tiene su propio endpoint y su propio manejo de resultado.
        const updateRows = pendingRows.filter((row) => row.action === 'update');
        const installRows = pendingRows.filter((row) => row.action === 'install');
        const materialsRows = pendingRows.filter((row) => row.action === 'materials');

        if (updateRows.length > 0) {
            await this._pushUpdateOperations(updateRows);
        }

        for (const row of installRows) {
            await this._pushSimpleOperation(row, {
                // operation_id viaja en el payload para que el backend pueda deduplicar
                // (SPEC.md §9 — WorkOrdersController::store ahora chequea sync_operations).
                call: (payload) => SyncService.storeWorkOrderInstallation({ ...payload, operation_id: row.operation_id }),
                parseResult: (response) => ({ status: response?.data?.status, message: response?.data?.message }),
                onSuccess: (tx) => tx.executeSql(
                    `UPDATE work_orders SET sync_status = 'synced', last_synced_at = ? WHERE id_orden_trabajo = ?`,
                    [new Date().toISOString(), row.entity_id]
                ),
            });
        }

        for (const row of materialsRows) {
            await this._pushSimpleOperation(row, {
                call: (payload) => SyncService.storeMaterialsOrder({ operation_id: row.operation_id, lines: payload.lines || [] }),
                parseResult: (response) => ({ status: response?.status, message: response?.message }),
                onSuccess: (tx) => tx.executeSql(
                    // Todas las líneas 'pending' de esta OT vienen del mismo batch que
                    // recién se confirmó: se marcan 'synced' juntas.
                    `UPDATE materials_order SET sync_status = 'synced' WHERE id_orden_trabajo = ? AND sync_status = 'pending'`,
                    [row.entity_id]
                ),
            });
        }
    }

    async _pushUpdateOperations(pendingRows) {
        const operations = pendingRows.map((row) => ({
            operation_id: row.operation_id,
            entity: row.entity,
            action: row.action,
            server_id: row.entity_id,
            expected_version: row.expected_version,
            payload: JSON.parse(row.payload || '{}'),
        }));

        const response = await SyncService.push(operations);
        const results = response?.data?.results || [];
        const rowsByOperationId = new Map(pendingRows.map((row) => [row.operation_id, row]));

        for (const result of results) {
            const row = rowsByOperationId.get(result.operation_id);
            if (!row) {
                continue;
            }
            await this._applyPushResult(row, result);
        }
    }

    /**
     * Maneja el push de una operación cuyo endpoint no tiene control de versión (a
     * diferencia de 'update', que sí lo tiene — ver _pushUpdateOperations/_applyPushResult
     * — y por eso usa /api/sync/push con expected_version/conflict). Reutilizado por
     * 'install' y 'materials'; la próxima acción de este tipo (Ubicación, Fotos) suma un
     * `call`/`parseResult`/`onSuccess` acá en vez de repetir todo el manejo de
     * éxito/error/logging/clasificación de errores.
     *
     * Clasifica la respuesta (SPEC.md §18 y §46 caso 7): un 4xx es un rechazo definitivo
     * del servidor — la misma request nunca va a tener éxito sin cambiar los datos, así
     * que NO se reintenta sola indefinidamente (markPermanentlyFailed). Un 5xx, o
     * cualquier excepción de red/transporte, se trata como transitorio y sí se reintenta
     * con backoff exponencial (igual que 'update').
     *
     * @param {object} row Fila de sync_queue.
     * @param {object} options
     * @param {(payload: object) => Promise<object>} options.call Llama al endpoint de la acción.
     * @param {(response: object) => {status: (number|undefined), message: (string|undefined)}} options.parseResult
     *   Normaliza la respuesta — distintos endpoints envuelven distinto (install:
     *   {data:{status}}, materials: {status} plano).
     * @param {(tx: object) => Promise<void>} options.onSuccess Efecto local a aplicar en la
     *   misma transacción que marca la cola como synced.
     */
    async _pushSimpleOperation(row, { call, parseResult, onSuccess }) {
        const label = row.action;
        try {
            const payload = JSON.parse(row.payload || '{}');
            // Log completo (sin truncar, a diferencia del recuadro de DevSyncPanel) de
            // cada intento real, automático o manual, para poder diagnosticar por qué el
            // backend rechaza una operación sin depender de apretar botones en el panel.
            console.log(`[SyncManager] ${label} -> operation_id=${row.operation_id}`, JSON.stringify(payload));
            const response = await call(payload);
            console.log(`[SyncManager] ${label} <- respuesta operation_id=${row.operation_id}`, JSON.stringify(response));

            const { status, message } = parseResult(response);
            const classification = RetryPolicy.classifyHttpStatus(status);

            if (classification === 'success') {
                // Registro + cola se actualizan en la misma transacción (SPEC.md, sección 24):
                // nunca debe quedar el dato local en su nuevo estado con la cola sin marcar synced.
                await this.db.runExclusive(async (tx) => {
                    await onSuccess(tx);
                    await SyncQueue.markSynced(tx.executeSql, row.id);
                });
                return;
            }

            if (classification === 'permanent') {
                console.error(`[SyncManager] ${label} operation_id=${row.operation_id} rechazado en forma permanente (status=${status}): ${message}`);
                await SyncQueue.markPermanentlyFailed(this.db.executeSql, row.id, {
                    error: message || `Rechazo definitivo del servidor (status ${status})`,
                });
                return;
            }

            const attempts = (row.attempts || 0) + 1;
            await SyncQueue.markFailed(this.db.executeSql, row.id, {
                attempts,
                error: message || 'Error desconocido al sincronizar',
                nextRetryAt: RetryPolicy.getNextRetryAt(attempts),
            });
        } catch (error) {
            // Excepción real (red/timeout/JS) siempre se trata como transitoria.
            console.error(`[SyncManager] ${label} operation_id=${row.operation_id} lanzó una excepción:`, error);
            const attempts = (row.attempts || 0) + 1;
            await SyncQueue.markFailed(this.db.executeSql, row.id, {
                attempts,
                error: error.message || 'Error de red al sincronizar',
                nextRetryAt: RetryPolicy.getNextRetryAt(attempts),
            });
        }
    }

    async _applyPushResult(row, result) {
        if (result.status === 'synced') {
            // Registro + cola se actualizan en la misma transacción (SPEC.md, sección 24): nunca
            // debe quedar el work_order con la versión nueva y la cola sin marcar synced.
            await this.db.runExclusive(async (tx) => {
                await tx.executeSql(
                    `UPDATE work_orders SET version = ?, sync_status = 'synced', last_synced_at = ? WHERE id_orden_trabajo = ?`,
                    [result.server_version, new Date().toISOString(), row.entity_id]
                );
                await SyncQueue.markSynced(tx.executeSql, row.id);
            });
            return;
        }

        if (result.status === 'conflict') {
            ConflictResolver.resolveConflict(row.entity, { queueRow: row, serverResult: result });
            await SyncQueue.markConflict(this.db.executeSql, row.id);
            return;
        }

        // "Unsupported entity/action" es un rechazo permanente y conocido del propio
        // backend (SyncController::processOperation) — un error de configuración/código,
        // no algo transitorio; reintentarlo no va a cambiar el resultado (SPEC.md §18).
        if (result.error === 'Unsupported entity/action for this sync endpoint') {
            await SyncQueue.markPermanentlyFailed(this.db.executeSql, row.id, { error: result.error });
            return;
        }

        const attempts = (row.attempts || 0) + 1;
        await SyncQueue.markFailed(this.db.executeSql, row.id, {
            attempts,
            error: result.error || 'Error desconocido al sincronizar',
            nextRetryAt: RetryPolicy.getNextRetryAt(attempts),
        });
    }

    async _pullChanges() {
        let cursor = Number((await AsyncStorage.getItem(CURSOR_STORAGE_KEY)) || '0');

        // Sigue pidiendo páginas mientras el cursor avance (SPEC.md, sección 11).
        for (;;) {
            const response = await SyncService.pull(cursor);
            const payload = response?.data || {};
            const changes = payload.data || [];
            const nextCursor = payload.next_cursor ?? cursor;

            if (changes.length === 0 || nextCursor === cursor) {
                break;
            }

            await this._applyChanges(changes);
            // El cursor solo avanza después de aplicar los cambios correctamente
            // (SPEC.md, sección 25), para poder reprocesar si la app se cierra a la mitad.
            cursor = nextCursor;
            await AsyncStorage.setItem(CURSOR_STORAGE_KEY, String(cursor));
        }
    }

    async _applyChanges(changes) {
        const workOrderChanges = changes.filter((change) => change.entity === 'work_orders');
        if (workOrderChanges.length === 0) {
            return;
        }

        await this.db.runExclusive(async (tx) => {
            for (const change of workOrderChanges) {
                if (change.action === 'delete') {
                    await tx.executeSql(
                        `UPDATE work_orders SET deleted_at = ?, sync_status = 'synced', last_synced_at = ? WHERE id_orden_trabajo = ?`,
                        [new Date().toISOString(), new Date().toISOString(), change.id]
                    );
                    continue;
                }

                // Este slice no trae el resto de columnas por cada change — solo confirma
                // la versión. Los datos completos de la OT los sigue trayendo el flujo de
                // lectura existente (getListWorkOrders/getWorkOrdersByTaskId); acá solo se
                // evita pisar un sync_status='pending' local con una fila que todavía
                // tiene una operación propia esperando salir.
                await tx.executeSql(
                    `UPDATE work_orders SET version = ?, sync_status = 'synced', last_synced_at = ? WHERE id_orden_trabajo = ? AND sync_status != 'pending'`,
                    [change.version, new Date().toISOString(), change.id]
                );
            }
        });
    }
}

export default new SyncManager();
