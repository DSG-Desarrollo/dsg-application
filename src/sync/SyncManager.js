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
