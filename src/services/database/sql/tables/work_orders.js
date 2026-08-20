const WORK_ORDERS = {
    tableName: 'work_orders',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_orden_trabajo: 'INTEGER',
        id_tarea: 'INTEGER',
        id_municipio: 'INTEGER',
        numero_orden: 'INTEGER',
        actual: 'TEXT',
        cambio: 'TEXT',
        instalacion: 'TEXT',
        direccion_orden_trabajo: 'TEXT',
        progreso_orden_trabajo: 'TEXT',
        inicio_orden_trabajo: 'TEXT',
        fin_orden_trabajo: 'TEXT',
        estado_orden_trabajo: 'TEXT',
        estado_orden_trabajo: 'TEXT',
        version: 'INTEGER NULL'
    },
    FOREIGN_KEYS: {
        task_id: {
            tableName: 'task',
            foreignKey: 'id_tarea',
        },
        municipality_id: {
            tableName: 'municipality',
            foreignKey: 'id_municipio',
        },
    }
};

export default WORK_ORDERS;