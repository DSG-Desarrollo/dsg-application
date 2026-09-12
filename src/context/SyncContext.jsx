// SyncContext.jsx
// Conecta SyncManager (singleton fuera de React) con el ciclo de vida de la app: lo
// configura con el acceso a SQLite en cuanto la base de datos está lista, dispara una
// sincronización al iniciar (SPEC.md, sección 26) y otra cada vez que NetworkMonitor
// detecta que se recuperó la conexión (SPEC.md, sección 27). También expone
// `useSyncState()` para cualquier pantalla que quiera mostrar el estado de sync.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
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

        console.log('[SyncContext] suscribiéndose a NetworkMonitor');
        const unsubscribe = NetworkMonitor.subscribe((event) => {
            console.log(`[SyncContext] evento de NetworkMonitor recibido: ${event.type}`);
            if (event.type === 'online') {
                SyncManager.requestSync();
            }
        });

        // Respaldo del evento de arriba: en Android, el listener pasivo de NetInfo a
        // veces no dispara al recuperar conexión (sobre todo cruzando modo avión), y sin
        // esto la cola quedaría esperando para siempre hasta el próximo reinicio de la
        // app. syncNow() ya hace su propio chequeo activo (NetworkMonitor.checkNow())
        // antes de intentar nada, así que llamarlo en cada regreso a primer plano es
        // seguro: si en verdad sigue offline, no hace ninguna llamada de red real.
        const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                console.log('[SyncContext] app en primer plano -> requestSync() de respaldo');
                SyncManager.requestSync();
            }
        });

        return () => {
            console.log('[SyncContext] desuscribiéndose de NetworkMonitor (efecto se re-ejecuta o se desmonta)');
            unsubscribe();
            appStateSubscription.remove();
        };
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
