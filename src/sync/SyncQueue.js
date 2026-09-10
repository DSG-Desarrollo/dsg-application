// SyncQueue.js
// Envoltorio delgado sobre la tabla local sync_queue (SPEC.md, sección 8). Cada función recibe
// la función executeSql/getAllRows a usar en vez de abrir su propia conexión, para poder
// llamarse tanto fuera de una transacción (DatabaseContext.executeSql/getAllAsyncSql)
// como dentro de una (el `tx.executeSql` que entrega DatabaseService.runExclusive) sin
// duplicar lógica ni arriesgar el deadlock que documenta runExclusive.
const nowIso = () => new Date().toISOString();

export const enqueue = async (executeSql, { operationId, entity, entityId, action, payload, expectedVersion }) => {
    const now = nowIso();
    await executeSql(
        `INSERT INTO sync_queue (operation_id, entity, entity_id, action, payload, expected_version, status, attempts, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
        [operationId, entity, entityId, action, JSON.stringify(payload ?? {}), expectedVersion, now, now]
    );
};

export const listPending = async (getAllRows, { limit = 50 } = {}) => {
    const rows = await getAllRows(
        `SELECT * FROM sync_queue WHERE status IN ('pending', 'failed') AND (next_retry_at IS NULL OR next_retry_at <= ?) ORDER BY id ASC LIMIT ?`,
        [nowIso(), limit]
    );
    return rows || [];
};

export const markSynced = async (executeSql, id) => {
    await executeSql(`UPDATE sync_queue SET status = 'synced', updated_at = ? WHERE id = ?`, [nowIso(), id]);
};

export const markConflict = async (executeSql, id) => {
    await executeSql(`UPDATE sync_queue SET status = 'conflict', updated_at = ? WHERE id = ?`, [nowIso(), id]);
};

export const markFailed = async (executeSql, id, { attempts, error, nextRetryAt }) => {
    await executeSql(
        `UPDATE sync_queue SET status = 'failed', attempts = ?, last_error = ?, next_retry_at = ?, updated_at = ? WHERE id = ?`,
        [attempts, error, nextRetryAt, nowIso(), id]
    );
};

// Rechazo definitivo del servidor (4xx — SPEC.md §18/§46 caso 7): a diferencia de
// markFailed, no fija next_retry_at, y el status 'failed_permanent' queda fuera del
// WHERE de listPending — así esta fila nunca vuelve a reintentarse sola. Sigue visible
// en la cola (para diagnosticar/reintentar manualmente si se corrige el dato de origen).
export const markPermanentlyFailed = async (executeSql, id, { error }) => {
    await executeSql(
        `UPDATE sync_queue SET status = 'failed_permanent', last_error = ?, next_retry_at = NULL, updated_at = ? WHERE id = ?`,
        [error, nowIso(), id]
    );
};

export const countByStatus = async (getAllRows) => {
    const rows = await getAllRows(`SELECT status, COUNT(*) as count FROM sync_queue GROUP BY status`);
    const counts = { pending: 0, failed: 0, failed_permanent: 0, conflict: 0, synced: 0 };
    (rows || []).forEach((row) => {
        counts[row.status] = row.count;
    });
    return counts;
};

export default { enqueue, listPending, markSynced, markConflict, markFailed, markPermanentlyFailed, countByStatus };
