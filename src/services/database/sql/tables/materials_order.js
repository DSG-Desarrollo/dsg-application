// Líneas de materiales usados por OT (refleja 'materiales_ordenes' del servidor, ver
// sp_upsert_material_orden / sp_ordenes_trabajos_materiales_resumen). Clave de negocio:
// (id_orden_trabajo, id_aprovisionamiento), igual que el WHERE del stored procedure.
const MATERIALS_ORDER = {
    tableName: 'materials_order',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_orden_trabajo: 'INTEGER',
        id_aprovisionamiento: 'INTEGER',
        cantidad: 'INTEGER',
        // Metadatos de sincronización, mismo criterio que work_orders.
        sync_status: "TEXT DEFAULT 'synced'",
    },
};

export default MATERIALS_ORDER;
