import { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../context/DatabaseContext';

/**
 * Hook para insertar o actualizar datos en una tabla de SQLite.
 *
 * @param {Array} data - Datos a insertar o actualizar.
 * @param {string} tableName - Nombre de la tabla principal.
 * @param {Object} tableConfig - Configuración de la tabla, incluyendo nombres de columnas y campos de identificación.
 * @returns {Object} - Estado de la operación y funciones de utilidad.
 */
const useMethodSaveToSQLite = (data, tableName, tableConfig) => {
  const [isSaved, setIsSaved] = useState(false);
  const [savedData, setSavedData] = useState([]);
  const hasRun = useRef(false);
  const { getAllAsyncSql, executeSql } = useDatabase();

  useEffect(() => {
    const saveData = async () => {
      if (data && data.length > 0 && !isSaved && !hasRun.current) {
        console.log('Ejecutando saveData - Inserción en SQLite'); // Registro para depuración
        try {
          setIsSaved(true);
          await upsertDataToTables(data, tableName, tableConfig);
          hasRun.current = true; // Marcamos que la operación se ha realizado
        } catch (error) {
          console.error('Error al guardar los datos en SQLite:', error);
        }
      }
    };

    saveData();
  }, [data, isSaved]);

  /**
   * Inserta o actualiza datos en una tabla de la base de datos SQLite.
   * 
   * @param {Array} data - Datos a insertar o actualizar.
   * @param {string} tableName - Nombre de la tabla principal.
   * @param {Object} tableConfig - Configuración de la tabla.
   * @returns {Promise<void>} - Promesa que se resuelve cuando los datos han sido insertados o actualizados.
   */
  const upsertDataToTables = async (data, tableName, tableConfig) => {
    for (const obj of data) {
      const primaryData = { ...obj };
      const relationships = {};

      // Verificar y separar relaciones de datos anidados
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          relationships[key] = value;
          delete primaryData[key];
        }
      }

      await upsertDataIntoTable(tableName, primaryData, tableConfig.primaryKey);

      // Procesar relaciones de datos anidados
      for (const [key, relatedData] of Object.entries(relationships)) {
        if (tableConfig.relationships && tableConfig.relationships[key]) {
          const relatedTable = tableConfig.relationships[key].table;
          const relatedKey = tableConfig.relationships[key].primaryKey;
          await upsertDataIntoTable(relatedTable, relatedData, relatedKey);
        }
      }
    }
  };

  /**
   * Inserta o actualiza datos en una tabla de la base de datos SQLite.
   * 
   * @param {string} tableName - Nombre de la tabla.
   * @param {Object} data - Datos a insertar o actualizar.
   * @param {string} primaryKey - Campo de identificación principal.
   * @returns {Promise<void>} - Promesa que se resuelve cuando los datos han sido insertados o actualizados.
   */
  const upsertDataIntoTable = async (tableName, data, primaryKey) => {
    const columns = Object.keys(data);
    const values = columns.map((column) => data[column] || null);
    const placeholders = columns.map(() => '?').join(', ');

    await executeSql('BEGIN TRANSACTION');

    try {
      const existingDataQuery = `SELECT * FROM ${tableName} WHERE ${primaryKey} = ? LIMIT 1`;
      const existingData = await getAllAsyncSql(existingDataQuery, [data[primaryKey]]);

      if (existingData.length === 0) {
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        await executeSql(query, values);
        console.log(`Data inserted into ${tableName} - ${query}`);
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
          const updateQuery = `UPDATE ${tableName} SET ${updateColumns} WHERE ${primaryKey} = ?`;
          await executeSql(updateQuery, [...values, data[primaryKey]]);
          console.log(`Data updated in ${tableName} - ${updateQuery}`);
        } else {
          console.log(`Data already up-to-date in ${tableName} for ${primaryKey}: ${data[primaryKey]}`);
        }
      }
      await executeSql('COMMIT');
    } catch (error) {
      await executeSql('ROLLBACK');
      console.error(`Error upserting data into ${tableName}:`, error);
    }
  };

  const fetchAllSavedData = async (query) => {
    try {
      const result = await getAllAsyncSql(query);
      setSavedData(result);
      return result;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  };

  return { isSaved, savedData, fetchAllSavedData };
};

export default useMethodSaveToSQLite;
