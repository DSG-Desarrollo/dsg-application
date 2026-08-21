import { StyleSheet } from 'react-native';
import theme from '@themes/theme';

export const unitDetail = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F6F7FB',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontFamily: 'Roboto',
    fontSize: 15,
    backgroundColor: theme.colors.successDark,
    color: '#FFFFFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: '#000',
    width: 90, // Ancho fijo para las etiquetas
  },
  text: {
    fontSize: 16,
    color: '#333',
    flex: 1, // El texto ocupa todo el espacio restante
  },
});
