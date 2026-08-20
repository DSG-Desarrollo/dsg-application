const EMPLOYEES = {
    tableName: 'employee',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        employee_id: 'INTEGER',
        user_id: 'INTEGER',
        id_municipio: 'INTEGER',
        nombre_empleado: 'TEXT',
        apellido_empleado: 'TEXT',
        dui_empleado: 'TEXT',
        nit_empleado: 'TEXT',
        tipo_afp: 'TEXT',
        isss_empleado: 'TEXT',
        nup_empleado: 'TEXT',
        direccion_empleado: 'TEXT',
        sexo_empleado: 'TEXT',
        estado_civil_empleado: 'TEXT',
        nacionalidad_empleado: 'TEXT',
        fecha_nacimiento: 'TEXT',
        correo_empleado: 'TEXT',
        telefono_empleado: 'TEXT',
        celular_empleado: 'TEXT',
        numero_cuenta_empleado: 'TEXT',
        estado_empleado: 'TEXT',
        registro_empleado: 'TEXT'
    }
};

export default EMPLOYEES;