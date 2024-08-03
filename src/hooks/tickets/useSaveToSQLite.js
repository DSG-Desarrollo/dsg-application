import { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../../context/DatabaseContext';

const useSaveToSQLite = (data) => {
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
          processObject(data, 'task');
          hasRun.current = true; // Marcamos que la operación se ha realizado
        } catch (error) {
          console.error('Error al guardar los datos en SQLite:', error);
        }
      }
    };

    saveData();
  }, [data, isSaved]);

  const processObject = (data, tableName) => {
    data.forEach((obj) => {
      delete obj.revision_user; // Eliminar el nodo 'revision_user' antes de procesar

      let primaryData = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value !== 'object' || value === null) {
          primaryData[key] = value;
        } else if (typeof value === 'object' && value !== null) {
          switch (key) {
            case 'customer_service':
              insertDataIntoTable('customer_service', value);
              break;
            case 'priority':
              insertDataIntoTable('priority', value);
              break;
            case 'author':
              insertDataIntoTable('author', value);
              break;
            case 'types_tasks':
              const { service, ...rest } = value;
              insertDataIntoTable('types_tasks', rest);
              if (service) insertDataIntoTable('service', service);
              break;
            default:
              break;
          }
        }
      }
      insertDataIntoTable(tableName, primaryData);
    });
  };

  const insertDataIntoTable = async (tableName, data) => {
    const columns = Object.keys(data);
    const values = columns.map((column) => data[column] || null);
    const placeholders = columns.map(() => '?').join(', ');
    const query = `INSERT OR IGNORE INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    try {
      //await executeSql(query, values);
      //console.log(`Data inserted into ${tableName} - ${query}`);
    } catch (error) {
      console.error(`Error inserting data into ${tableName}:`, error);
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
  
  // Ejemplo de uso
  /*useEffect(() => {
    fetchInsertedTasks();
  }, []);*/
  
  useEffect(() => {
    //fetchTaskById(4444);
  }, []);

  return { isSaved, savedData, fetchAllSavedTickets };
};

export default useSaveToSQLite;
