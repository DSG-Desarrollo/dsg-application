import { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../../context/DatabaseContext';

const useSaveToSQLite = (data) => {
  console.log(data);
  const [isSaved, setIsSaved] = useState(false);
  const [savedData, setSavedData] = useState([]);
  const hasRun = useRef(false); // Usamos useRef para mantener un valor persistente
  const { getAllAsyncSql, executeSql } = useDatabase();

  useEffect(() => {
    const saveData = async () => {
      if (data && data.length > 0 && !isSaved && !hasRun.current) {
        console.log('Ejecutando saveData - Inserción en SQLite'); // Registro para depuración
        try {
          setIsSaved(true);
          upsertDataToTables(data, 'task');
          hasRun.current = true; // Marcamos que la operación se ha realizado
        } catch (error) {
          console.error('Error al guardar los datos en SQLite:', error);
        }
      }
    };

    saveData();
  }, [data, isSaved]);

/**
 * Procesa un array de objetos y los inserta en la base de datos SQLite. 
 * Primero elimina el campo 'revision_user' de cada objeto. Luego, 
 * inserta datos en las tablas correspondientes según el contenido 
 * de cada objeto, manejando tablas relacionadas y evitando duplicados 
 * utilizando claves primarias.
 * 
 * @param {Array} data - Array de objetos a procesar e insertar en la base de datos.
 * @param {string} tableName - Nombre de la tabla principal donde se insertarán los datos.
 * @returns {Promise<void>} - Promesa que se resuelve cuando todos los datos han sido procesados e insertados.
 */
  const upsertDataToTables = async (data, tableName) => {
    for (const obj of data) {
      delete obj.revision_user; // Remove 'revision_user' node before processing

      let primaryData = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value !== 'object' || value === null) {
          primaryData[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          switch (key) {
            case 'customer_service':
              await upsertDataIntoTable('customer_service', value, 'id_servicio_cliente');
              break;
            case 'priority':
              await upsertDataIntoTable('priority', value, 'id_prioridad_tarea');
              break;
            case 'author':
              await upsertDataIntoTable('author', value, 'id_usuario');
              break;
            case 'types_tasks':
              const { service, ...rest } = value;
              await upsertDataIntoTable('types_tasks', rest, 'id_tipo_tarea');
              if (service) await upsertDataIntoTable('service', service, 'id_servicio');
              break;
            default:
              break;
          }
        }
      }
      await upsertDataIntoTable(tableName, primaryData, 'id_tarea');
    }
  };

  /**
   * Inserta o actualiza datos en una tabla de la base de datos SQLite.
   * 
   * @param {string} tableName - Nombre de la tabla donde se insertarán o actualizarán los datos.
   * @param {Object} data - Objeto que contiene los datos a insertar o actualizar.
   * @param {string} secondaryIdField - Nombre del campo que se utiliza como identificador único secundario.
   * @returns {Promise<void>} - Promesa que se resuelve cuando los datos han sido insertados o actualizados.
   */
  const upsertDataIntoTable = async (tableName, data, secondaryIdField) => {
    const columns = Object.keys(data);
    const values = columns.map((column) => data[column] || null);
    const placeholders = columns.map(() => '?').join(', ');

    await executeSql('BEGIN TRANSACTION');

    try {
      const existingDataQuery = `SELECT * FROM ${tableName} WHERE ${secondaryIdField} = ? LIMIT 1`;
      const existingData = await getAllAsyncSql(existingDataQuery, [data[secondaryIdField]]);

      if (existingData.length === 0) {
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        await executeSql(query, values);
        //console.log(`Data inserted into ${tableName} - ${query}`);
      } else {
        const existingRecord = existingData[0];
        let needsUpdate = false;
        for (const [key, value] of Object.entries(data)) {
          if (existingRecord[key] !== value) {
            needsUpdate = true;
            break;
          }
        }
        if (needsUpdate) {
          const updateColumns = columns.map(column => `${column} = ?`).join(', ');
          const updateQuery = `UPDATE ${tableName} SET ${updateColumns} WHERE ${secondaryIdField} = ?`;
          await executeSql(updateQuery, [...values, data[secondaryIdField]]);
          //console.log(`Data updated in ${tableName} - ${updateQuery}`);
        } else {
          //console.log(`Data already up-to-date in ${tableName} for ${secondaryIdField}: ${data[secondaryIdField]}`);
        }
      }
      await executeSql('COMMIT');
    } catch (error) {
      await executeSql('ROLLBACK');
      console.error(`Error upserting data into ${tableName}:`, error);
    }
  };

  const fetchAllSavedTickets = async (taskId) => {
    const query = `
      SELECT DISTINCT
        task.id,
        task.id_tarea,
        task.codigo_tarea,
        task.estado_tarea,
        task.descripcion_tarea,
        task.fecha_inicio_tarea,
        task.registro_fecha,
        task.fecha_fin_tarea,
        task.progreso_tarea,
        task.id_prioridad_tarea,
        task.direccion_tarea,
        task.numero_solicitud,
        task.orden_requerida,
        task.orden_completada,

        customer_service.id_cliente,
        customer_service.id_servicio_cliente,
        customer_service.descripcion_servicio_cliente,

        types_tasks.tipo_tarea,
        types_tasks.color_tipo_tarea,

        service.servicio,
        priority.prioridad_tarea
      FROM task
      JOIN customer_service ON task.id_servicio_cliente = customer_service.id_servicio_cliente
      JOIN types_tasks ON task.id_tipo_tarea = types_tasks.id_tipo_tarea
      JOIN service on types_tasks.id_servicio = service.id_servicio
      JOIN priority ON task.id_prioridad_tarea = priority.id_prioridad_tarea
      ORDER BY task.id_tarea DESC
      ;
    `;

    try {
      const result = await getAllAsyncSql(query);
      setSavedData(result);
      //console.log('Task data:', result);
      return result; // Devuelve el resultado obtenido
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      return [];
    }
  };  

  const fetchInsertedTasks = async () => {
    try {
      const query = "SELECT * FROM customer_service WHERE id_servicio_cliente = 56";
      const result = await getAllAsyncSql(query);
      
      console.log(result);
      
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  return { isSaved, savedData, fetchAllSavedTickets };
};

export default useSaveToSQLite;
