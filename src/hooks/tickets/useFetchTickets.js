// useFetchTickets.js (Hook para la solicitud HTTP)
import { useState, useEffect } from 'react';
import TicketService from '../../services/api/tickets/TicketService';

const useFetchTickets = (filters) => {
  const ticketService = new TicketService();
  const [ticketsData, setTicketsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const tickets = await ticketService.getTickets(filters);
        setTicketsData(tickets);
      } catch (error) {
        setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.');
      }
    };

    fetchTickets();
  }, []);

  return { ticketsData, error };
};

export default useFetchTickets;