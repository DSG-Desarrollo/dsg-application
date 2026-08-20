const PRIORITIES = {
    tableName: 'priority',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_prioridad_tarea: 'INTEGER',
        prioridad_tarea: 'TEXT',
        dia_solucion: 'INTEGER',
        efectividad: 'TEXT',
        color_prioridad_tarea: 'TEXT',
        estado_prioridad: 'TEXT',
        registro_prioridad: 'TEXT'
    }
};

export default PRIORITIES;