// Regla compartida entre useNetworkState (hook) y NetworkMonitor (singleton fuera de
// React) para decidir si el estado que reporta NetInfo debe tratarse como "conectado".
// Extraída de useNetworkState para no duplicarla en ambos lugares.

/**
 * @param {import('@react-native-community/netinfo').NetInfoState} netInfoState
 * @returns {{ isConnected: boolean, effectiveBandwidth: number, type: string|null, cellularGeneration: string|null }|null}
 *   null cuando NetInfo todavía no determinó el estado real de la red (isConnected null/undefined).
 */
export const evaluateConnectionQuality = (netInfoState) => {
    if (netInfoState?.isConnected === null || netInfoState?.isConnected === undefined) {
        return null;
    }

    let isConnected = netInfoState.isConnected;
    const effectiveBandwidth = netInfoState.details?.downlink || 0; // downlink en Mbps
    const type = netInfoState.type;
    const cellularGeneration = netInfoState.details?.cellularGeneration || null;

    // Considerar conexiones móviles de baja calidad como sin conexión
    if (type === 'cellular') {
        if (['2g', '3g'].includes(cellularGeneration) || effectiveBandwidth < 1) {
            isConnected = false;
        }
    }

    return { isConnected, effectiveBandwidth, type, cellularGeneration };
};
