import { createRef } from 'react';

// Declara una referencia de navegación
export const navigationRef = createRef();

// Función para navegar a una ruta específica
export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}
