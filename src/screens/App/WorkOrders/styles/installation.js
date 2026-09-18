import { StyleSheet } from "react-native";
import { spacing, palette } from '@themes';

const { red } = palette;
const { md } = spacing;

export const createInstallationStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  footer: {
    padding: md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },

  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center', // Alinear verticalmente los elementos en el grupo
  },

  radioGroupHorizontal: {
    flexDirection: 'row', // Cambiar la dirección del diseño a horizontal
    alignItems: 'center', // Alinear los elementos verticalmente en el centro
    justifyContent: 'space-between', // Espacio uniforme entre los elementos
    marginTop: 10, // Espacio superior opcional
  },

  radioContainer: {
    flexDirection: 'row', // Alinear los radios y el texto horizontalmente
    alignItems: 'center', // Alinear los elementos verticalmente en el centro
  },

  radioLabel: {
    fontSize: 16,
    marginLeft: 8, // Espacio entre el radio button y el texto
    color: colors.text,
  },

  errorContainer: {
    marginTop: 5,
    backgroundColor: red[100],
    padding: 5,
    borderRadius: 5,
  },

  errorMessage: {
    color: red[600],
    fontSize: 14,
    fontWeight: 'bold',
  },
});