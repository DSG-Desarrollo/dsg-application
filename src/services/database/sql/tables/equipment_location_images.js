// Imagen de ubicación de instalación por OT (tab "Ubicación"). A diferencia de
// Instalación/Materiales, acá el dato es un archivo (SPEC.md §32): nunca se guarda el
// base64 en SQLite — local_image_path apunta a un archivo real en el dispositivo
// (expo-file-system), que es la fuente de verdad para mostrar el lienzo offline.
const EQUIPMENT_LOCATION_IMAGES = {
    tableName: 'equipment_location_images',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_orden_trabajo: 'INTEGER',
        id_tarea: 'INTEGER',
        tipo_equipo: 'TEXT NULL',
        comentario_imagen: 'TEXT NULL',
        local_image_path: 'TEXT NULL',
        // Se completa recién cuando se sincroniza con éxito (o si el registro se hidrató
        // desde el servidor en un dispositivo nuevo) — no hace falta para leer offline.
        remote_image_url: 'TEXT NULL',
        sync_status: "TEXT DEFAULT 'synced'",
        last_synced_at: 'TEXT NULL',
    },
};

export default EQUIPMENT_LOCATION_IMAGES;
