import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  plugins: ['expo-localization', "expo-asset"],
  extra: {
    wsERPURL: process.env.WS_BASE_URL,
    DBNAME: process.env.DB_NAME,
    eas: {
      projectId: 'f990977d-e454-427d-865b-27481130d47a'
    }
  },
});
