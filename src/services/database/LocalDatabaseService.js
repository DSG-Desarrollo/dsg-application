// LocalDatabaseService.js
import { useDatabase } from '../../context/DatabaseContext';

const LocalDatabaseService = () => {
  const { databaseContext, getAllAsyncSql, getFirstAsyncSql, isDatabaseInitialized, executeSql } = useDatabase();

  return {

  };
};

export default LocalDatabaseService;
