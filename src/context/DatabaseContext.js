import React, { createContext, useContext, useEffect, useState } from 'react';
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

  const getTableStructure = async (tableName) => {
    try {
      if (databaseService) {
        return await databaseService.getTableStructure(tableName);
      }
    } catch (error) {
      console.error('Error al obtener la estructura de la tabla:', error);
    }
    return null;
  };

  const executeSql = async (sql, params = []) => {
    try {
      if (databaseService) {
        return await databaseService.executeSql(sql, params);
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta SQL:', error);
    }
    return null;
  };

  const getAllAsyncSql = async (sql, params = []) => {
    try {
      if (databaseService) {
        return await databaseService.getAllRows(sql, params);
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta SQL:', error);
    }
    return null;
  };

  const getFirstAsyncSql = async (sql, params = []) => {
    try {
      if (databaseService) {
        return await databaseService.getFirstRow(sql, params);
      }
    } catch (error) {
      console.error('Error al ejecutar la consulta SQL:', error);
    }
    return null;
  }

  return (
    <DatabaseContext.Provider value={
      {
        getTableStructure, executeSql, getAllAsyncSql,
        getFirstAsyncSql, isDatabaseInitialized, errorInitializingDatabase
      }
    }>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
