const  USERS = {
    tableName: 'user',
    columns: {
        id: 'INTEGER PRIMARY KEY',
        user_id: 'INTEGER',
        employee_id: 'INTEGER',
        user_type_id: 'INTEGER',
        username: 'TEXT',
        password: 'TEXT',
        user_status: 'TEXT',
        observation: 'TEXT',
        photo_name: 'TEXT',
        user_registration: 'TEXT',
        // JSON de la relación 'employee.position' que devuelve el login online
        // (User::with('employee.position')). Se cachea para poder reconstruir
        // userData.employee durante un login offline, ya que la tabla 'user'
        // solo guarda columnas planas y no hay tabla local poblada para
        // 'employee' todavía.
        employee_json: 'TEXT'
    }
};

export default USERS;