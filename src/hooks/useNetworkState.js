import { useEffect, useState } from 'react';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import i18n from '../../i18n';

NetInfo.configure({
    reachabilityUrl: 'https://clients3.google.com/generate_204',
    reachabilityMethod: 'HEAD',
    reachabilityTest: async (response) => response.status === 204,
    reachabilityShortTimeout: 5000,
    reachabilityLongTimeout: 60000,
    reachabilityRequestTimeout: 15000,
    useNativeReachability: true,
});

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
