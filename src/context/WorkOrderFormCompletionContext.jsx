import React, { createContext, useContext } from 'react';

// Permite que los tabs de una OT (Instalación, Materiales, Ubicación, Fotos) avisen a
// TabNavigatorWorkOrder cuando terminan de guardar, sin pasar una función por
// route.params (React Navigation serializa/persiste el estado de navegación y advierte
// -y puede romper- si los params contienen funciones).
export const WorkOrderFormCompletionContext = createContext(() => {});

export const WorkOrderFormCompletionProvider = ({ onFormCompleted, children }) => (
  <WorkOrderFormCompletionContext.Provider value={onFormCompleted}>
    {children}
  </WorkOrderFormCompletionContext.Provider>
);

export const useWorkOrderFormCompletion = () => useContext(WorkOrderFormCompletionContext);
