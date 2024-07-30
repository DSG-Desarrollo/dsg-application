// useFetchTickets.js (Hook para la solicitud HTTP)
import { useState, useEffect } from 'react';
import TicketService from '../services/api/tickets/TicketService';
import useNetworkState from './useNetworkState';
import { getUserDataFromStorage } from '../utils/storageUtils';

const useFetchTickets = (filter) => {
  const ticketService = new TicketService();
  const [ticketsData, setTicketsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { networkState } = useNetworkState();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await getUserDataFromStorage();
        setUserData(data);
      } catch (err) {
        setError('Error al cargar los datos del usuario');
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!networkState.isConnected) {
        setError('No hay conexión de red');
        setLoading(false);
        return;
      }

      try {
        const filters = {
          ...filter,
          "id_puesto_empleado": userData.employee.id_empleado,
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
  }, [networkState, userData]);

  /*const insertTicketsData = async (tickets) => {
    try {
      const formattedSql = ticketsData.map(ticket => formatTicketDataToSql(ticket)).join(';');

    } catch (error) {
      console.error("Error al insertar datos de tickets:", error);
    }
  }*/

  /*const formatTicketDataToSql = (ticketData) => {
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
  }*/

  return { ticketsData, loading, error };
};

export default useFetchTickets;