const POSITIONS = {
    tableName: 'position',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        position_id: 'INTEGER',
        employee_id: 'INTEGER',
        id_tipo_empleado: 'INTEGER',
        id_cargo: 'INTEGER',
        id_departamento_empresa: 'INTEGER',
        id_forma_pago: 'INTEGER',
        fecha_inicio_puesto_empleado: 'TEXT',
        fecha_fin_puesto_empleado: 'TEXT',
        salario_ordinario: 'TEXT',
        tipo_contrato: 'TEXT',
        estado_puesto_empleado: 'TEXT',
        registro_puesto_empleado: 'TEXT'
    }
};

export default POSITIONS;