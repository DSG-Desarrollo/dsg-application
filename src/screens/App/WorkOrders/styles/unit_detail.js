import { StyleSheet } from 'react-native';
import theme from '@themes/theme';

export const createUnitDetailStyles = (colors) => StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
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
    color: colors.textSecondary,
    width: 90, // Ancho fijo para las etiquetas
  },
  text: {
    fontSize: 16,
    color: colors.text,
    flex: 1, // El texto ocupa todo el espacio restante
  },
});
