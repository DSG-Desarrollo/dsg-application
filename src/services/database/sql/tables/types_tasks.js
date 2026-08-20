const TYPES_TASKS = {
    tableName: 'types_tasks',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_tipo_tarea: 'INTEGER',
        id_autorizacion_predeterminada: 'INTEGER NULL',
        id_servicio: 'INTEGER',
        codigo_tipo_tarea: 'TEXT',
        tipo_tarea: 'TEXT',
        unidad_actual: 'TEXT NULL',
        unidad_cambio: 'TEXT NULL',
        importar_articulo_actual_de: 'TEXT NULL',
        importar_articulo_cambio_de: 'TEXT NULL',
        requiereOrden: 'TEXT',
        requiereUbicacion: 'TEXT',
        requiereTipoInstalacion: 'TEXT',
        requiereMateriales: 'TEXT',
        requiereFirma: 'TEXT',
        color_tipo_tarea: 'TEXT',
        equipo: 'TEXT',
        detalle_cambio: 'TEXT',
        estado_tipo_tarea: 'TEXT',
        limite_solicitud: 'INTEGER',
        limite_asignacion: 'INTEGER',
    },
    FOREIGN_KEYS: {
        service_id: {
            tableName: 'service',
            foreignKey: 'id_servicio',
        },
        default_authorization_id: {
            tableName: 'authorization',
            foreignKey: 'id_autorizacion_predeterminada',
        }
    }
};

export default TYPES_TASKS;