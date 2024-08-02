import { useDatabase } from "../../context/DatabaseContext";

const insertApiData = async (data) => {
    const { executeSql } = useDatabase();
  
    try {
      for (const typeTask of data.types_tasks) {
        const columns = Object.keys(typeTask).join(', ');
        const placeholders = Object.keys(typeTask).map(() => '?').join(', ');
        const values = Object.values(typeTask);
        console.log(columns);
  
        const sql = `INSERT INTO types_tasks (${columns}) VALUES (${placeholders})`;
  
        //await executeSql(sql, values);
      }
      //console.log('Datos insertados correctamente.');
    } catch (error) {
      //console.error('Error al insertar datos:', error);
    }
};
  
  export default insertApiData;