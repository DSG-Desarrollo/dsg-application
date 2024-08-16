import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10, // Añadido padding general para separar el contenido de los bordes de la pantalla
    },
    pickerContainer: {
      marginBottom: 20, // Espacio debajo del selector
    },
    picker: {
      color: '#333',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff',
    },
    pickerItem: {
      justifyContent: 'flex-start',
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    canvasContainer: {
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      overflow: 'hidden', // Para evitar que los dibujos se salgan del canvas
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between', // Espacio entre botones
      paddingHorizontal: 20, // Espacio horizontal en el contenedor de botones
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#e0e0e0',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginHorizontal: 10, // Espacio horizontal entre los botones
    },
    buttonText: {
      marginLeft: 10,
      color: '#007bff',
      fontSize: 16,
    },
  });

export default styles;