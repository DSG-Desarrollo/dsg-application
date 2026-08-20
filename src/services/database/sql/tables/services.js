const SERVICES =  {
    tableName: 'service',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_servicio: 'INTEGER',
        id_empresa: 'INTEGER',
        codigo_servicio: 'TEXT',
        servicio: 'TEXT',
        estado_servicio: 'TEXT'
    }
};

export default SERVICES;