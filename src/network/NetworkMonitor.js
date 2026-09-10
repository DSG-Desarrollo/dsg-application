// NetworkMonitor.js
// Singleton (no un hook) que expone el estado de conectividad fuera del árbol de React,
// para que SyncManager pueda suscribirse a cambios de red sin depender de un componente
// montado (ver SPEC.md, secciones 4 y 27).
import NetInfo from '@react-native-community/netinfo';
import { evaluateConnectionQuality } from '@utils/networkQuality';

class NetworkMonitor {
    constructor() {
        this.isConnected = true; // optimista hasta la primera lectura real, igual que useNetworkState
        this.listeners = new Set();
        this.unsubscribeNetInfo = null;
    }

    /**
     * Empieza a escuchar NetInfo. Idempotente: llamar varias veces no duplica el listener.
     */
    start() {
        if (this.unsubscribeNetInfo) {
            return;
        }

        this.unsubscribeNetInfo = NetInfo.addEventListener((state) => {
            this._applyState(state);
        });
    }

    stop() {
        if (this.unsubscribeNetInfo) {
            this.unsubscribeNetInfo();
            this.unsubscribeNetInfo = null;
        }
    }

    _applyState(netInfoState) {
        const quality = evaluateConnectionQuality(netInfoState);
        if (!quality) {
            console.log('[NetworkMonitor] evento de NetInfo ignorado (quality=null):', JSON.stringify(netInfoState));
            return;
        }

        const wasConnected = this.isConnected;
        this.isConnected = quality.isConnected;
        console.log(`[NetworkMonitor] wasConnected=${wasConnected} -> isConnected=${this.isConnected} (type=${quality.type}) listeners=${this.listeners.size}`);

        if (!wasConnected && this.isConnected) {
            console.log('[NetworkMonitor] disparando evento "online" a los listeners');
            this.listeners.forEach((listener) => listener({ type: 'online' }));
        } else if (wasConnected && !this.isConnected) {
            console.log('[NetworkMonitor] disparando evento "offline" a los listeners');
            this.listeners.forEach((listener) => listener({ type: 'offline' }));
        }
    }

    getIsConnected() {
        return this.isConnected;
    }

    /**
     * Fuerza una lectura real contra NetInfo (spec sección 27: isConnected no es garantía
     * absoluta de acceso al servidor, pero al menos refresca el estado de la interfaz de red).
     */
    async checkNow() {
        const state = await NetInfo.fetch();
        this._applyState(state);
        return this.isConnected;
    }

    /**
     * @param {(event: {type: 'online'|'offline'}) => void} listener
     * @returns {() => void} función para desuscribirse
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

export default new NetworkMonitor();
