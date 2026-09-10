// SyncState.js
// Store pub-sub mínimo con el estado global de sincronización (SPEC.md, secciones 29-30).
// Deliberadamente no es un Context de React: SyncManager corre fuera del árbol de
// componentes y necesita poder actualizar este estado desde cualquier lugar. `useSyncState`
// (en SyncContext.jsx) es el punto de entrada para consumirlo desde la UI.
let state = {
    status: 'idle', // idle | syncing | success | error | offline | conflict
    pendingCount: 0,
    failedCount: 0,
    // Rechazos definitivos del servidor (4xx) — SPEC.md §18/§46 caso 7: se muestran
    // aparte de failedCount (que sí sigue reintentando) porque no se reintentan solos.
    failedPermanentCount: 0,
    conflictCount: 0,
    lastSyncedAt: null,
    lastError: null,
};

const listeners = new Set();

export const getState = () => state;

export const setState = (partial) => {
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener(state));
};

/**
 * @param {(state: typeof state) => void} listener
 * @returns {() => void}
 */
export const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export default { getState, setState, subscribe };
