import { useState, useEffect, useReducer } from 'react';
import { useIsFocused } from '@react-navigation/native';
import TicketService from '@services/api/tickets/TicketService';
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
  // TicketsScreen usa un bottom tab navigator (createBottomTabNavigator), que por
  // defecto mantiene cada pestaña montada una vez visitada en vez de desmontarla al
  // cambiar de tab. Sin isFocused acá, este hook solo pedía datos una vez (al montar/al
  // reconectar) y una pestaña visitada antes de que un ticket cambiara de estado en el
  // servidor (p.ej. se completó offline y luego sincronizó) quedaba con esa lista vieja
  // para siempre en esa sesión — el usuario tenía que reiniciar la app para verla al día.
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!networkState.isConnected || !isFocused) return;

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
  }, [networkState.isConnected, isFocused]);

  return state;
};

export default useFetchTickets;
