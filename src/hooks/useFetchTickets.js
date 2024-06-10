// useFetchTickets.js (Hook para la solicitud HTTP)
import { useState, useEffect } from 'react';
import TicketService from '../services/api/tickets/TicketService';
import useNetworkState from './useNetworkState';

const useFetchTickets = () => {
  const ticketService = new TicketService();
  const [ticketsData, setTicketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { networkState } = useNetworkState();

  useEffect(() => {
    const fetchTickets = async () => {
      if (!networkState.isConnected) {
        setError('No hay conexión de red');
        setLoading(false);
        return;
      }

      try {
        const filters = {
          progreso_tarea: 'S',
          estado_asignacion: 'A',
          user_id: null,
        };
        const tickets = await ticketService.getTickets(filters);
        //console.log(tickets);
        setTicketsData(tickets);
        setLoading(false);
        await insertTicketsData(tickets);
      } catch (error) {
        console.log('Error al obtener los datos:', error);
        setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchTickets();
  }, [networkState]);

  const insertTicketsData = async (tickets) => {
    try {
      console.log(tickets.length);
      const formattedSql = ticketsData.map(ticket => formatTicketDataToSql(ticket)).join(';');
      console.log(formattedSql);
      //await executeSql(formattedSql);

    } catch (error) {
      console.error("Error al insertar datos de tickets:", error);
    }
  }

  const formatTicketDataToSql = (ticketData) => {
    const ticketColumns = Object.keys(ticketData).filter(key => {
      return typeof ticketData[key] !== 'object' && key !== 'customer_service' && key !== 'priority' && key !== 'author';
    });

    const ticketValues = ticketColumns.map(key => {
      const value = ticketData[key];
      return value === null ? 'NULL' : typeof value === 'string' ? `'${value}'` : value;
    });

    const columns = ticketColumns.join(', ');
    const values = ticketValues.join(', ');

    return `INSERT INTO task (${columns}) VALUES (${values})`;
  }

  return { ticketsData, loading, error };
};

export default useFetchTickets;