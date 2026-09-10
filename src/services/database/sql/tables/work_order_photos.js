// Evidencia fotográfica (recepción/entrega) por OT (tab "Fotos"). Igual criterio que
// equipment_location_images (SPEC.md §32): local_path apunta a un archivo real copiado
// al almacenamiento propio de la app — nunca se guarda la imagen en SQLite. A diferencia
// de las otras tablas de work_orders, acá cada fila es UN ítem de una lista (no hay un
// único registro por OT), y admite tombstone (deleted_at, SPEC.md §13): una foto ya
// subida que se borra offline no desaparece de inmediato, queda marcada hasta que el
// borrado se sincroniza.
const WORK_ORDER_PHOTOS = {
    tableName: 'work_order_photos',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_orden_trabajo: 'INTEGER',
        id_tarea: 'INTEGER',
        cliente_id: 'INTEGER',
        section: 'TEXT', // 'reception' | 'delivery' (mapea a ANTES/DESPUES del backend)
        local_path: 'TEXT',
        remote_id: 'INTEGER NULL', // id_evidencia una vez subida
        remote_url: 'TEXT NULL',
        sync_status: "TEXT DEFAULT 'pending'",
        deleted_at: 'TEXT NULL',
    },
};

export default WORK_ORDER_PHOTOS;
