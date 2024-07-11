import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  plugins: ['expo-localization', "expo-asset"],
  extra: {
    wsERPURL: process.env.WS_BASE_URL,
    DBNAME: process.env.DB_NAME,
    eas: {
      projectId: 'b19a1a48-d69b-4f7d-8b5f-b5aafb61b42d'
    }
  },
});
