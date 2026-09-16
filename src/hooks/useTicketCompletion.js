import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import WorkOrderRepository from '@repositories/WorkOrderRepository';

/**
 * Offline-first: lee siempre de SQLite local (WorkOrderRepository.getLocalTicketProgress),
 * la misma fuente que ya actualiza completeTicket tanto online como offline — no hace
 * falta ningún endpoint para saber si un ticket ya quedó cerrado (firma del cliente).
 * Se re-chequea cada vez que la pestaña recupera el foco (mismo criterio que TicketsTab:
 * sin esto, un ticket recién completado en otra pestaña no se reflejaría hasta reabrir
 * la app), así que los 4 tabs de una OT (Instalación/Materiales/Ubicación/Fotos) pueden
 * usar esto para ocultar "Guardar" y bloquear los inputs en cuanto el ticket se completa
 * — incluso si el técnico sigue con la pantalla abierta en ese momento.
 *
 * @param {number|string} tareaId
 * @returns {{ isCompleted: boolean, isLoading: boolean }}
 */
const useTicketCompletion = (tareaId) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const workOrderRepository = WorkOrderRepository();

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const check = async () => {
        setIsLoading(true);
        try {
          const progreso = await workOrderRepository.getLocalTicketProgress(tareaId);
          if (!cancelled) setIsCompleted(progreso === 'C');
        } catch (error) {
          console.error('Error al verificar si el ticket está completado:', error);
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      };

      check();

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tareaId])
  );

  return { isCompleted, isLoading };
};

export default useTicketCompletion;
