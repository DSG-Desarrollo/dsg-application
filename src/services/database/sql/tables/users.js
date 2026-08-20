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
        user_registration: 'TEXT'
    }
};

export default USERS;