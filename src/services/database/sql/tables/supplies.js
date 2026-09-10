// Catálogo de insumos disponibles del empleado (GraphQL suppliesByUserId), cacheado
// para poder mostrar la pestaña Materiales offline. No es por OT: es por técnico.
const SUPPLIES = {
    tableName: 'supplies',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        // Clave de negocio: es el mismo 'id' que devuelve el GraphQL (id_aprovisionamiento
        // en el backend) — se usa tal cual para armar el payload de materials-order.
        id_aprovisionamiento: 'INTEGER',
        employee_id: 'INTEGER',
        product_id: 'INTEGER',
        product_name: 'TEXT',
        quantity: 'INTEGER',
        brand: 'TEXT NULL',
        unit_of_measure: 'TEXT',
        minimum: 'INTEGER',
        maximum: 'INTEGER',
    },
};

export default SUPPLIES;
