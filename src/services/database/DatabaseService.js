import * as SQLite from 'expo-sqlite'; // Importa solo SQLite
import schemas from './schemas'; // Importa tus esquemas desde el archivo correspondiente

/**
 * Clase que proporciona métodos para interactuar con una base de datos SQLite en una aplicación Expo.
 */
class DatabaseService {
    /**
     * Constructor de la clase DatabaseService.
     * @param {string} dbName - Nombre de la base de datos.
     */
    constructor(dbName) {
        this.dbName = dbName;
        this.db = null;
    }

    /**
     * Inicializa la base de datos creando las tablas necesarias.
     * Si la base de datos ya existe, esta función no hace nada.
     */
    async initDatabase() {
        try {
            this.db = await SQLite.openDatabaseAsync(this.dbName);
            if (!this.db) {
                throw new Error('La base de datos no pudo ser abierta');
            }
            await this.createTables();
            this.log('Base de datos inicializada correctamente.');
        } catch (error) {
            this.handleError('Error al inicializar la base de datos:', error);
            throw new Error('Error al inicializar la base de datos');
        }
    }

    /**
     * Crea las tablas en la base de datos según los esquemas definidos.
     */
    async createTables() {
        const schemaNames = Object.keys(schemas);
        for (const tableName of schemaNames) {
            const schema = schemas[tableName];
            const createTableSQL = this.generateCreateTableSQL(tableName, schema);
            try {
                await this.db.execAsync(createTableSQL);
                this.log(`Tabla '${schema.tableName}' creada correctamente.`);
            } catch (error) {
                this.handleError(`Error al crear la tabla '${schema.tableName}':`, error);
            }
        }
    }

    /**
     * Genera la consulta SQL para crear una tabla a partir del esquema proporcionado.
     * @param {string} tableName - Nombre de la tabla.
     * @param {object} schema - Esquema de la tabla que contiene las columnas.
     * @returns {string} - Consulta SQL para crear la tabla.
     */
    generateCreateTableSQL(tableName, schema) {
        const columns = Object.entries(schema.columns)
            .map(([columnName, columnType]) => `${columnName} ${columnType}`)
            .join(', ');
        return `CREATE TABLE IF NOT EXISTS ${schema.tableName} (${columns})`;
    }

    /**
     * Obtiene la estructura de una tabla en la base de datos.
     * @param {string} tableName - El nombre de la tabla de la que se desea obtener la estructura.
     * @returns {Promise<Array<Object>|null>} - Una promesa que se resuelve con un array de objetos que representan la estructura de la tabla especificada.
     * Si hay un error al obtener la estructura, devuelve `null`.
     */
    async getTableStructure(tableName) {
        const query = `PRAGMA table_info(${tableName})`;
        try {
            const tableInfo = await this.db.getAllAsync(query);
            this.log(`Estructura de la tabla '${tableName}':`, tableInfo);
            return tableInfo;
        } catch (error) {
            this.handleError(`Error al obtener la estructura de la tabla '${tableName}':`, error);
            throw new Error(`Error al obtener la estructura de la tabla '${tableName}'`);
        }
    }

    /**
     * Ejecuta una serie de consultas SQL dentro de una transacción.
     * @param {Array<{sql: string, args: Array}>} operations - Array de operaciones SQL a ejecutar.
     * @returns {Promise<void>} - Promesa que se resuelve cuando todas las operaciones se han completado.
     * @throws {Error} - Lanza un error si alguna operación falla.
     */
    async executeTransaction(operations) {
        if (!this.db) {
            throw new Error('Base de datos no inicializada');
        }

        try {
            await this.db.execAsync('BEGIN TRANSACTION'); // Iniciar transacción

            for (const operation of operations) {
                const { sql, args } = operation;
                await this.db.runAsync(sql, ...args);
            }

            await this.db.execAsync('COMMIT'); // Confirmar transacción
            this.log('Transacción completada correctamente.');
        } catch (error) {
            await this.db.execAsync('ROLLBACK'); // Revertir transacción en caso de error
            this.handleError('Error en la transacción:', error);
            throw new Error('Error en la transacción');
        }
    }

    /**
     * Ejecuta una consulta SQL en la base de datos SQLite.
     * @param {string} sqlStatement - La consulta SQL que se va a ejecutar.
     * @param {Array} args - Los argumentos opcionales que se pueden pasar a la consulta SQL.
     * @returns {Promise} Una promesa que se resuelve con los resultados de la consulta o se rechaza con un error.
     */
    async executeSql(sqlStatement, args = []) {
        try {
            const results = await this.db.runAsync(sqlStatement, ...args);
            //this.log('Resultado de la consulta:', results);
            return results;
        } catch (error) {
            this.handleError('Error al ejecutar la consulta DB:', error);
            throw new Error('Error al ejecutar la consulta');
        }
    }

    /**
     * Ejecuta una consulta SQL en la base de datos SQLite y obtiene la primera fila de resultados.
     * @param {string} sqlStatement - La consulta SQL que se va a ejecutar.
     * @param {Array} [args=[]] - Los argumentos opcionales que se pueden pasar a la consulta SQL.
     * @returns {Promise} Una promesa que se resuelve con la primera fila de resultados de la consulta.
     * @throws {Error} Error al obtener el primer resultado de la consulta.
     */
    async getFirstRow(sqlStatement, args = []) {
        try {
            const firstRow = await this.db.getFirstAsync(sqlStatement, ...args);
            this.log('Primer resultado de la consulta:', firstRow);
            return firstRow;
        } catch (error) {
            this.handleError('Error al obtener el primer resultado de la consulta:', error);
            throw new Error('Error al obtener el primer resultado de la consulta');
        }
    }

    /**
     * Ejecuta una consulta SQL en la base de datos SQLite y devuelve todas las filas resultantes.
     * @param {string} sqlStatement - La consulta SQL que se va a ejecutar.
     * @param {Array} args - Los argumentos opcionales que se pueden pasar a la consulta SQL.
     * @returns {Promise<Array<Object>|null>} Una promesa que se resuelve con un array de objetos que representan todas las filas devueltas por la consulta.
     * Si hay un error al ejecutar la consulta, se rechaza la promesa y se lanza una excepción con el mensaje de error.
     */
    async getAllRows(sqlStatement, args = []) {
        try {
            const allRows = await this.db.getAllAsync(sqlStatement, ...args);
            //this.log('Todos los resultados de la consulta (getAllRows):', allRows);
            return allRows;
        } catch (error) {
            /*this.handleError('Error al obtener todos los resultados de la consulta (getAllRows):', error);
            throw new Error('Error al obtener todos los resultados de la consulta (getAllRows)');*/
        }
    }

    /**
     * Cierra la conexión a la base de datos SQLite.
     */
    async closeDatabase() {
        if (this.db) {
            try {
                await this.db.closeAsync();
                this.log('Conexión a la base de datos cerrada correctamente.');
                this.db = null;
            } catch (error) {
                this.handleError('Error al cerrar la conexión a la base de datos:', error);
                throw new Error('Error al cerrar la conexión a la base de datos');
            }
        } else {
            this.log('La conexión a la base de datos ya está cerrada o no ha sido abierta.');
        }
    }

    /**
     * Método para registrar mensajes de información.
     * @param {string} message - Mensaje a registrar.
     */
    log(message, data = null) {
        if (data) {
            console.info(message, data);
        } else {
            console.info(message);
        }
    }

    /**
     * Método para manejar y registrar errores.
     * @param {string} message - Mensaje de error a registrar.
     * @param {Error} error - Objeto de error.
     */
    handleError(message, error) {
        console.error(message, error);
    }
}

export default DatabaseService;
