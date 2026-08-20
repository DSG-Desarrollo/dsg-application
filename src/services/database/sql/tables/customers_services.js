const CUSTOMERS_SERVICES = {
    tableName: 'customers_services',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        id_servicio_cliente: 'INTEGER',
        id_cliente: 'INTEGER',
        id_servicio: 'INTEGER',
        id_tipo_facturacion: 'TEXT NULL',
        id_forma_pago: 'TEXT NULL',
        descripcion_servicio_cliente: 'TEXT',
        estado_servicio_cliente: 'TEXT',
        registro_servicio_cliente: 'TEXT'
    }
};

export default CUSTOMERS_SERVICES;