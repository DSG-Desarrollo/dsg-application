// databaseUtilsTickets.js
import { useDatabase } from "../../context/DatabaseContext";

const databaseUtilsTickets = () => {
    const { executeSql } = useDatabase();

    const insertTicketsData = async (ticketsData) => {
        try {
            for (const ticket of ticketsData) {
                const formattedSql = formatTicketDataToSql(ticket);
                await executeSql(formattedSql);

            }
            console.log("Datos de tickets insertados correctamente.");
        } catch (error) {
            console.error("Error al insertar datos de tickets:", error);
        }
    }

    const formatTicketDataToSql = async (ticketData) => {
        const ticketColumns = Object.keys(ticketData).filter(key => {
            // Filtrar las claves que no son objetos
            return typeof ticketData[key] !== 'object' && key !== 'customer_service' && key !== 'priority' && key !== 'author';
        });

        const ticketValues = ticketColumns.map(key => {
            const value = ticketData[key];
            // Si el valor es NULL, devolvemos 'NULL' en lugar de dejarlo vacío
            return value === null ? 'NULL' : typeof value === 'string' ? `'${value}'` : value;
        });

        const columns = ticketColumns.join(', ');
        const values = ticketValues.join(', ');

        const sql = `INSERT INTO task (${columns}) VALUES (${values});`;

        return sql;
    }

    const insertRelatedData = async (ticketData) => {
        // Insertar en la tabla customer_service
        const customerServiceData = ticketData.customer_service;

        const customerServiceColumns = Object.keys(customerServiceData);
  
        const customerServiceValues = customerServiceColumns.map(key => {
            const value = customerServiceData[key];
            if (value === null || value === undefined) {
                return 'NULL';
            } else if (typeof value === 'string') {
                return `'${value}'`;
            } else {
                return value;
            }
        });

        console.log("Estructura de servicios: ", customerServiceData);
        console.log('Columnas procesadas: ', customerServiceColumns);
        console.log('Values procesadas: ', customerServiceValues);

        //const customerServiceSql = `INSERT INTO customer_service (${customerServiceColumns.join(', ')}) VALUES (${customerServiceValues.join(', ')});`;
        /*console.log(customerServiceSql);    
        await databaseContext.executeSql(customerServiceSql);
        console.log("no se que pasa!!! POR DIOS");

       
        const selectTask = 'select * from customer_service';
        const resultTask = await databaseContext.executeSql(selectTask);
        console.log(resultTask);

        // Insertar en la tabla priority
        /*const priorityData = ticketData.priority;
        const priorityColumns = Object.keys(priorityData).filter(key => {
            return typeof priorityData[key] !== 'object'; // Filtrar las claves que no son objetos
        });
        const priorityValues = priorityColumns.map(key => {
            const value = priorityData[key];
            return value === null ? 'NULL' : typeof value === 'string' ? `'${value}'` : value;
        });
        const prioritySql = `INSERT INTO priority (${priorityColumns.join(', ')}) VALUES (${priorityValues.join(', ')});`;*/

        // Insertar en la tabla author
        /*const authorData = ticketData.author;
        const authorColumns = Object.keys(authorData).filter(key => {
            return typeof authorData[key] !== 'object'; // Filtrar las claves que no son objetos
        });
        const authorValues = authorColumns.map(key => {
            const value = authorData[key];
            return value === null ? 'NULL' : typeof value === 'string' ? `'${value}'` : value;
        });
        const authorSql = `INSERT INTO author (${authorColumns.join(', ')}) VALUES (${authorValues.join(', ')});`;*/

        // Ejecutar las consultas SQL
        /*await databaseContext.executeSql(customerServiceSql);
        await databaseContext.executeSql(prioritySql);
        await databaseContext.executeSql(authorSql);*/

        //console.log("Datos relacionados insertados correctamente.");
    }

    return {
        insertTicketsData
    };
}

export default databaseUtilsTickets;
