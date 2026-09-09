// SyncContext.jsx
// Conecta SyncManager (singleton fuera de React) con el ciclo de vida de la app: lo
// configura con el acceso a SQLite en cuanto la base de datos está lista, dispara una
// sincronización al iniciar (SPEC.md, sección 26) y otra cada vez que NetworkMonitor
// detecta que se recuperó la conexión (SPEC.md, sección 27). También expone
// `useSyncState()` para cualquier pantalla que quiera mostrar el estado de sync.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDatabase } from './DatabaseContext';
import NetworkMonitor from '../network/NetworkMonitor';
import SyncManager from '../sync/SyncManager';
import * as SyncState from '../sync/SyncState';

const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
    const { isDatabaseInitialized, executeSql, getAllAsyncSql, getFirstAsyncSql, runExclusive } = useDatabase();

    useEffect(() => {
        NetworkMonitor.start();
        return () => NetworkMonitor.stop();
    }, []);

    useEffect(() => {
        if (!isDatabaseInitialized) {
            return;
        }

        SyncManager.configure({
            db: { executeSql, getAllAsyncSql, getFirstAsyncSql, runExclusive },
        });

        // Sincroniza al iniciar sin bloquear la interfaz (spec sección 26): la app ya
        // puede usar los datos locales mientras esto corre en segundo plano.
        SyncManager.requestSync();

        const unsubscribe = NetworkMonitor.subscribe((event) => {
            if (event.type === 'online') {
                SyncManager.requestSync();
            }
        });

        return unsubscribe;
    }, [isDatabaseInitialized, executeSql, getAllAsyncSql, getFirstAsyncSql, runExclusive]);

    return (
        <SyncContext.Provider value={{ requestSync: () => SyncManager.requestSync() }}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSync = () => useContext(SyncContext);

/**
 * @returns {ReturnType<typeof SyncState.getState>}
 */
export const useSyncState = () => {
    const [state, setState] = useState(SyncState.getState());

    useEffect(() => {
        return SyncState.subscribe(setState);
    }, []);

    return state;
};
