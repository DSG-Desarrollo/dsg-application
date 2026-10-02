// Regla compartida entre useNetworkState (hook) y NetworkMonitor (singleton fuera de
// React) para decidir si el estado que reporta NetInfo debe tratarse como "conectado".
// Extraída de useNetworkState para no duplicarla en ambos lugares.

/**
 * @param {import('@react-native-community/netinfo').NetInfoState} netInfoState
 * @returns {{ isConnected: boolean, effectiveBandwidth: number, hasBandwidth: boolean, type: string|null, cellularGeneration: string|null }|null}
 *   null cuando NetInfo todavía no determinó el estado real de la red (isConnected null/undefined,
 *   o conectado a una interfaz pero con isInternetReachable aún sin resolver).
 */
export const evaluateConnectionQuality = (netInfoState) => {
    if (netInfoState?.isConnected === null || netInfoState?.isConnected === undefined) {
        return null;
    }

    // isConnected solo dice que hay una interfaz de red activa (WiFi asociado, datos móviles
    // encendidos), no que haya salida a internet: con datos móviles activados pero sin plan,
    // o un WiFi sin internet, isConnected es true e isInternetReachable es false. Sin este
    // filtro la app se creía online, disparaba el sync y todo fallaba con UnknownHostException.
    // Mientras isInternetReachable sea null/undefined (NetInfo aún lo está determinando) se
    // devuelve null, igual que cuando isConnected es null: los llamadores conservan el último
    // estado conocido en vez de asumir online u offline.
    if (
        netInfoState.isConnected &&
        (netInfoState.isInternetReachable === null || netInfoState.isInternetReachable === undefined)
    ) {
        return null;
    }

    let isConnected = netInfoState.isConnected && netInfoState.isInternetReachable !== false;
    // `downlink` (Mbps) solo lo reporta NetInfo en web; en Android/iOS `details` de una
    // conexión celular trae únicamente cellularGeneration y carrier. Tratar su ausencia
    // como 0 Mbps hacía que TODA conexión de datos móviles se considerara "sin
    // conexión". Por eso el criterio de ancho de banda solo aplica si el dato existe.
    const downlink = netInfoState.details?.downlink;
    const hasBandwidth = typeof downlink === 'number';
    const effectiveBandwidth = hasBandwidth ? downlink : 0;
    const type = netInfoState.type;
    const cellularGeneration = netInfoState.details?.cellularGeneration || null;

    // Considerar conexiones móviles de baja calidad como sin conexión
    if (type === 'cellular') {
        if (cellularGeneration === '2g' || (hasBandwidth && effectiveBandwidth < 1)) {
            isConnected = false;
        }
    }

    return { isConnected, effectiveBandwidth, hasBandwidth, type, cellularGeneration };
};
