import { useEffect, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';
import i18n from '../../i18n';

/**
 * Hook personalizado para gestionar el estado de la red y la visibilidad del componente de información de red.
 * Este hook monitorea la conectividad de red del dispositivo y proporciona información al respecto.
 * También controla la visibilidad del componente de información de red, mostrándolo cuando cambia el estado de la red
 * y ocultándolo después de una duración especificada.
 * @param {number} hideDuration - Duración en milisegundos para ocultar el componente de red (predeterminado: 10000 ms).
 * @returns {{networkState: Object, showNetworkInfo: boolean}} Un objeto que contiene el estado de la red y un booleano que indica la visibilidad del componente de información de red.
 */
const useNetworkState = (hideDuration = 10000) => {
    const netInfo = useNetInfo();
    const [showNetworkInfo, setShowNetworkInfo] = useState(false);
    const [networkState, setNetworkState] = useState({
        isConnected: false,
        effectiveBandwidth: 0,
        type: null,
        cellularGeneration: null,
        error: null,
    });

    useEffect(() => {
        const checkNetworkState = () => {
            let isConnected = netInfo.isConnected;
            const effectiveBandwidth = netInfo.details?.downlink || 0; // downlink in Mbps
            const type = netInfo.type;
            const cellularGeneration = netInfo.details?.cellularGeneration || null;

            // Considerar conexiones móviles de baja calidad como sin conexión
            if (type === 'cellular') {
                if (['2g', '3g'].includes(cellularGeneration) || effectiveBandwidth < 1) {
                    isConnected = false;
                }
            }

            const error = isConnected ? null : i18n.t('networkError');

            setNetworkState({ isConnected, effectiveBandwidth, type, cellularGeneration, error });
            setShowNetworkInfo(true);

            setTimeout(() => {
                setShowNetworkInfo(false);
            }, hideDuration);
        };

        checkNetworkState();

        return () => {};
    }, [netInfo, hideDuration]);

    return { networkState, showNetworkInfo };
};

export default useNetworkState;
