const TASKS = {
    tableName: 'task',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_tarea: 'INTEGER',
        id_cliente: 'INTEGER NULL',
        id_tipo_tarea: 'INTEGER',
        id_servicio_cliente: 'INTEGER',
        id_prioridad_tarea: 'INTEGER',
        id_usuario: 'INTEGER',
        id_autorizacion_tarea: 'INTEGER',
        id_usuario_revision: 'INTEGER',
        id_municipio: 'INTEGER',
        codigo_tarea: 'TEXT NULL',
        puesto_trabajo: 'INTEGER NULL',
        descripcion_tarea: 'TEXT NULL',
        comentario_tarea: 'TEXT NULL',
        direccion_tarea: 'TEXT NULL',
        progreso_tarea: 'TEXT NULL',
        orden_requerida: 'INTEGER NULL',
        orden_completada: 'INTEGER NULL',
        correo_solicitud: 'INTEGER NULL',
        correo_inicio: 'INTEGER NULL',
        correo_completo: 'INTEGER NULL',
        fecha_inicio_tarea: 'TEXT NULL',
        fecha_fin_tarea: 'TEXT NULL',
        fecha_programacion: 'TEXT NULL',
        solicitud_programacion: 'TEXT NULL',
        comentario_programacion: 'TEXT NULL',
        comentario_cliente: 'TEXT NULL',
        id_autorizacion_programacion: 'INTEGER NULL',
        fecha_revision: 'TEXT NULL',
        comentario_rechazo: 'TEXT NULL',
        numero_solicitud: 'INTEGER NULL',
        estado_tarea: 'TEXT NULL',
        version: 'INTEGER NULL',
        registro_fecha: 'TEXT NULL',
        id_cuenta: 'INTEGER NULL',
        progreso_tarea_descripcion: 'TEXT NULL',
    },
    FOREIGN_KEYS: {
        customer_service_id: {
            tableName: 'customer_service',
            foreignKey: 'id_servicio_cliente',
        },
        priority_id: {
            tableName: 'priority',
            foreignKey: 'id_prioridad_tarea',
        },
        user_id: {
            tableName: 'user',
            foreignKey: 'id_usuario',
        },
        authorization_id: {
            tableName: 'authorization',
            foreignKey: 'id_autorizacion_tarea',
        },
        review_user_id: {
            tableName: 'user',
            foreignKey: 'id_usuario_revision',
        },
        municipality_id: {
            tableName: 'municipality',
            foreignKey: 'id_municipio',
        },
    }
};

export default TASKS;