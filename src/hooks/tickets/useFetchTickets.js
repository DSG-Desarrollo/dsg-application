import { useState, useEffect, useReducer } from 'react';
import TicketService from '../../services/api/tickets/TicketService';
import useNetworkState from '../useNetworkState';

const initialState = {
  ticketsData: [],
  error: null,
  isLoading: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, ticketsData: action.payload };
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    default:
      throw new Error();
  }
};

const useFetchTickets = (filters) => {
  const { networkState } = useNetworkState();
  const [state, dispatch] = useReducer(reducer, initialState);
  const ticketService = new TicketService();

  useEffect(() => {
    if (!networkState.isConnected) return;

    const fetchTickets = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const tickets = await ticketService.getTickets(filters);
        if (tickets.error) {
          dispatch({ type: 'FETCH_FAILURE', payload: tickets.error });
        } else {
          dispatch({ type: 'FETCH_SUCCESS', payload: tickets });
        }
      } catch (error) {
        dispatch({ type: 'FETCH_FAILURE', payload: 'Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.' });
      }
    };

    fetchTickets();
  }, [networkState.isConnected]);

  return state;
};

export default useFetchTickets;
