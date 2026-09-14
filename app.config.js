import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  plugins: ['expo-localization', "expo-asset", "@react-native-community/datetimepicker"],
  extra: {
    wsERPURL: process.env.WS_BASE_URL,
    DBNAME: process.env.DB_NAME,
    URL_INTERNET_CONNECTIVITY_TEST: process.env.URL_INTERNET_CONNECTIVITY_TEST,
    // Segundo seguro además de __DEV__ (que ya es false solo en cualquier build de
    // release/producción real, sin depender de esto): permite apagar el panel de
    // depuración a mano en un build de desarrollo que se vaya a compartir, sin tocar
    // código. Ambas condiciones deben cumplirse para que el panel se muestre — ver
    // src/utils/NetworkInfo.jsx.
    ENABLE_DEV_SYNC_PANEL: process.env.ENABLE_DEV_SYNC_PANEL !== 'false',
    eas: {
      projectId: 'b19a1a48-d69b-4f7d-8b5f-b5aafb61b42d'
    }
  },
});
