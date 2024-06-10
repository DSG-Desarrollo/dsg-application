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

    useEffect(() => {
        const checkNetworkState = () => {
            const isConnected = netInfo.isConnected;
            const error = isConnected ? null : i18n.t('networkError');

            setShowNetworkInfo(true);

            setTimeout(() => {
                setShowNetworkInfo(false);
            }, hideDuration);
        };

        checkNetworkState();

        return () => {};
    }, [netInfo, hideDuration]);

    return { networkState: netInfo, showNetworkInfo };
};

export default useNetworkState;
