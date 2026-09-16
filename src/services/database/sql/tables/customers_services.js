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
        registro_servicio_cliente: 'TEXT',
        // Aplanados desde customer_service.customer (ver useSaveToSQLite.js) para
        // poder resolver el nombre real del cliente offline, igual que
        // Customer::getNombreClienteRealAttribute en el backend.
        nombre_cliente: 'TEXT NULL',
        apellido_cliente: 'TEXT NULL',
        tipo_persona: 'TEXT NULL',
        nombre_comercial_cliente: 'TEXT NULL'
    }
};

export default CUSTOMERS_SERVICES;