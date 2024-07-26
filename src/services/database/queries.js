
const userQueries = {
    getUserById: `SELECT 
                      user_id AS user_id,
                      employee_id AS id_usuario,
                      user_type_id AS id_tipo_usuario,
                      username AS usuario,
                      password AS clave,
                      user_status AS estado_usuario,
                      observation AS observacion,
                      photo_name AS foto_nombre,
                      user_registration AS registro_usuario
                  FROM user WHERE employee_id = ?`,
    getUsersAll: `SELECT * FROM user`,
    truncateUsers: `DELETE FROM user`,
    checkUserExistence: `SELECT * FROM user WHERE employee_id = ?`,
};

const userInsertQueries = {
    insertUser: `INSERT INTO user (employee_id, user_type_id, username, password, user_status, observation, photo_name, user_registration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
};

const queries = {
    users: userQueries,
    userInserts: userInsertQueries,
};

export { queries };