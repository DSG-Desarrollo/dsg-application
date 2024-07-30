// TicketRepository.js
import TicketService from '../services/api/tickets/TicketService';
import useNetworkState from '../hooks/useNetworkState';
//import LocalDatabaseService from './LocalDatabaseService';

const TicketRepository = () => {
  const ticketService = new TicketService();
  const { isConnected } = useNetworkState();
  //const { insertTickets, getLocalTickets } = useLocalDatabaseService();

  const getTickets = async (filters) => {
    if (isConnected) {
      const tickets = await ticketService.getTickets(filters);
      //await insertTickets(tickets);
      return tickets;
    } else {
      //return await getLocalTickets();
    }
  };

  return {
    getTickets,
  };
};

export default TicketRepository;
