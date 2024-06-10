import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,

        margin: 5, // Margen alrededor del contenedor para separarlo de los bordes de la pantalla
    },
    pickerContainer: {
        width: '80%',
        marginBottom: 20,
        marginTop: 10,
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
    imageContainer: {
        flex: 1,
        width: '100%',
        marginBottom: 20,
    },
    fixedImageContainer: {
        width: '100%',
        height: '100%',
        margin: 10,
    },
    fixedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Cambiado a 'flex-start' para alinear a la izquierda
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 20, // Ajuste adicional para margen izquierdo
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        width: '80%',
        marginBottom: 10,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e0e0e0',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 5,
    },
    buttonText: {
        marginLeft: 10,
        color: '#007bff',
        fontSize: 16,
    },
});

export default styles;