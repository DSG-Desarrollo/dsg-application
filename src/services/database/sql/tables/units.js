const UNITS = {
    tableName: 'units',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_tarea: 'INTEGER',
        id_orden_trabajo: 'INTEGER',
        // numero_orden/progreso_orden_trabajo: el backend (UnitsQuery) sí los
        // devuelve y TicketDetailScreen los usa para el color/ícono de cada
        // OT, pero no estaban en este schema — sin ellos no se puede cachear
        // lo necesario para pintar la pantalla igual offline que online.
        numero_orden: 'TEXT NULL',
        progreso_orden_trabajo: 'TEXT NULL',
        id_unidad: 'INTEGER',
        id_servicio_cliente: 'INTEGER',
        unidad: 'TEXT',
        unidad_marca: 'TEXT',
        unidad_modelo: 'TEXT',
        unidad_color: 'TEXT'
    },
    FOREIGN_KEYS: {
        task_id: {
            tableName: 'task',
            foreignKey: 'id_tarea',
        },
        work_order_id: {
            tableName: 'work_orders',
            foreignKey: 'id_orden_trabajo',
        },
        customer_service_id: {
            tableName: 'customer_service',
            foreignKey: 'id_servicio_cliente',
        },
    }
};


export default UNITS;