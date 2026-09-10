import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import DatabaseService from '../services/database/DatabaseService';
import Constants from 'expo-constants';

const DatabaseContext = createContext(null);
const DBNAME = Constants.expoConfig.extra.DBNAME;

export const DatabaseProvider = ({ children }) => {
  const [databaseService, setDatabaseService] = useState(null);
  const [isDatabaseInitialized, setIsDatabaseInitialized] = useState(false);
  const [errorInitializingDatabase, setErrorInitializingDatabase] = useState(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      const dbService = new DatabaseService(DBNAME);
      try {
        await dbService.initDatabase();
        setDatabaseService(dbService);
        setIsDatabaseInitialized(true);
      } catch (error) {
        setErrorInitializingDatabase(error.message);
      }
    };

    initializeDatabase();
  }, []);

  // useCallback (con databaseService como única dependencia real) para que estas
  // funciones mantengan la misma referencia entre renders salvo cuando la conexión a
  // SQLite realmente cambia. Sin esto, cualquier consumidor que las use en un array de
  // dependencias de useEffect (p.ej. SyncContext, para suscribirse a NetworkMonitor) se
  // desuscribía y resuscribía en cada render de DatabaseProvider, no solo cuando hacía
  // falta.
  const getTableStructure = useCallback(async (tableName) => {
    try {
      if (databaseService) {
        return await databaseService.getTableStructure(tableName);
      }
    } catch (error) {
      console.error('Error al obtener la estructura de la tabla:', error);
    }
    return null;
  }, [databaseService]);

  const executeSql = useCallback(async (sql, params = []) => {
    try {
      if (databaseService) {
        return await databaseService.executeSql(sql, params);
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta SQL:', error);
    }
    return null;
  }, [databaseService]);

  const getAllAsyncSql = useCallback(async (sql, params = []) => {
    try {
      if (databaseService) {
        return await databaseService.getAllRows(sql, params);
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta SQL:', error);
    }
    return null;
  }, [databaseService]);

  const getFirstAsyncSql = useCallback(async (sql, params = []) => {
    try {
      if (databaseService) {
        return await databaseService.getFirstRow(sql, params);
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta SQL:', error);
    }
    return null;
  }, [databaseService]);

  const runExclusive = useCallback(async (callback) => {
    if (databaseService) {
      return await databaseService.runExclusive(callback);
    }
    return null;
  }, [databaseService]);

  return (
    <DatabaseContext.Provider value={
      {
        getTableStructure, executeSql, getAllAsyncSql,
        getFirstAsyncSql, runExclusive, isDatabaseInitialized, errorInitializingDatabase
      }
    }>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
