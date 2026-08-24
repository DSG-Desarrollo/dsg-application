import { StyleSheet } from "react-native";
import { spacing, palette } from '@themes';

const { red, white } = palette;
const { md } = spacing;

export const installation = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: white,
  },

  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  footer: {
    padding: md,
    borderTopWidth: 1,
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