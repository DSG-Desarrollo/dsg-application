import { useEffect, useState } from 'react';
import Constants from "expo-constants";
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import i18n from '@i18n/i18n';
import { HTTP_CODES } from '@constants/httpCodes';
import { evaluateConnectionQuality } from '@utils/networkQuality';
import NetworkMonitor from '@network/NetworkMonitor';

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
  const [networkState, setNetworkState] = useState(() => {
    // Cada pantalla monta su propia instancia de este hook (TicketsTab,
    // useFetchTickets, LoginScreen, el banner NetworkInfo, ...), y cada
    // instancia de useNetInfo() arranca en null hasta que su propio
    // listener interno dispara — así que `evaluateConnectionQuality(netInfo)`
    // suele devolver null en el primer render de una pantalla recién
    // montada, aunque el dispositivo ya esté offline hace rato. Antes
    // caíamos a un `true` optimista fijo en ese caso, lo que disparaba un
    // fetch real (y su "Network Error") apenas se entraba a una pantalla
    // nueva en modo avión. NetworkMonitor sí es confiable acá: es un
    // singleton que arrancó una sola vez en la raíz de la app (SyncProvider)
    // y ya tiene el estado real de conexión mucho antes de que cualquier
    // pantalla se monte, así que lo usamos como respaldo en vez de asumir
    // "conectado".
    const quality = evaluateConnectionQuality(netInfo);
    return (
      quality || {
        isConnected: NetworkMonitor.getIsConnected(),
        effectiveBandwidth: 0,
        type: null,
        cellularGeneration: null,
        error: null,
      }
    );
  });

  useEffect(() => {
    const checkNetworkState = () => {
      // NetInfo reporta null mientras determina el estado real de la red.
      // En ese caso no actualizamos (nos quedamos con el último valor
      // conocido / el optimista inicial) en vez de asumir "sin conexión".
      const quality = evaluateConnectionQuality(netInfo);
      if (!quality) {
        return;
      }

      const { isConnected, effectiveBandwidth, type, cellularGeneration } = quality;

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
