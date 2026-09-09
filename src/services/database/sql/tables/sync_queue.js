// Cola local de operaciones pendientes de sincronizar con el servidor (SPEC.md, sección 8).
const SYNC_QUEUE = {
    tableName: 'sync_queue',
    columns: {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        operation_id: 'TEXT',
        entity: 'TEXT',
        entity_id: 'INTEGER',
        action: 'TEXT',
        payload: 'TEXT',
        expected_version: 'INTEGER',
        status: 'TEXT',
        attempts: 'INTEGER DEFAULT 0',
        last_error: 'TEXT NULL',
        next_retry_at: 'TEXT NULL',
        created_at: 'TEXT',
        updated_at: 'TEXT'
    }
};

export default SYNC_QUEUE;
