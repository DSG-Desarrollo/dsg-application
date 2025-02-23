import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  plugins: ['expo-localization', "expo-asset"],
  extra: {
    wsERPURL: process.env.WS_BASE_URL,
    DBNAME: process.env.DB_NAME,
    eas: {
      projectId: '3b8289e8-09fa-4ae3-9276-41427d6d1f9d'
    }
  },
});
