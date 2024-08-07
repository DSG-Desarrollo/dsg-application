// useFetchTickets.js (Hook para la solicitud HTTP)
import { useState, useEffect } from 'react';
import TicketService from '../../services/api/tickets/TicketService';
import useNetworkState from '../useNetworkState';

const useFetchTickets = (filters) => {
  const { networkState } = useNetworkState();
  const ticketService = new TicketService();
  const [ticketsData, setTicketsData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!networkState.isConnected) return;
      
      setIsLoading(true);
      try {
        const tickets = await ticketService.getTickets(filters);
        setTicketsData(tickets);
      } catch (error) {
        setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [networkState.isConnected]);

  return { ticketsData, error, isLoading };
};

export default useFetchTickets;