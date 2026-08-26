import { useEffect, useState } from 'react';
import Constants from "expo-constants";
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import i18n from '@i18n/i18n';
import { HTTP_CODES } from '@constants/httpCodes';

const { NO_CONTENT } = HTTP_CODES;

const { URL_INTERNET_CONNECTIVITY_TEST } = Constants.expoConfig.extra;

NetInfo.configure({
    reachabilityUrl: URL_INTERNET_CONNECTIVITY_TEST,
    reachabilityMethod: 'HEAD',
    reachabilityTest: async (response) => response.status === NO_CONTENT,
    reachabilityShortTimeout: 5000,
    reachabilityLongTimeout: 60000,
    reachabilityRequestTimeout: 15000,
    useNativeReachability: true,
});

const useNetworkState = (hideDuration = 10000) => {
  const netInfo = useNetInfo();
  const [showNetworkInfo, setShowNetworkInfo] = useState(false);
  const [networkState, setNetworkState] = useState({
    // Optimista: hasta que NetInfo confirme el estado real (isConnected es
    // null durante el primer render), no queremos que pantallas como el
    // login traten a un usuario conectado como si estuviera sin conexión.
    isConnected: true,
    effectiveBandwidth: 0,
    type: null,
    cellularGeneration: null,
    error: null,
  });

  useEffect(() => {
    const checkNetworkState = () => {
      // NetInfo reporta null mientras determina el estado real de la red.
      // En ese caso no actualizamos (nos quedamos con el último valor
      // conocido / el optimista inicial) en vez de asumir "sin conexión".
      if (netInfo.isConnected === null || netInfo.isConnected === undefined) {
        return;
      }

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

      let error = null;
      if (!isConnected) {
        error = i18n.t('networkError');
      } else if (type === 'cellular' && effectiveBandwidth < 1) {
        error = i18n.t('slowConnectionError');
      }

      setNetworkState({ isConnected, effectiveBandwidth, type, cellularGeneration, error });
      setShowNetworkInfo(true);

      setTimeout(() => {
        setShowNetworkInfo(false);
      }, hideDuration);
    };

    checkNetworkState();
  }, [netInfo, hideDuration]);

  return { networkState, showNetworkInfo };
};

export default useNetworkState;
