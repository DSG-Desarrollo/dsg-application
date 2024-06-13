import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 5, // Margen alrededor del contenedor para separarlo de los bordes de la pantalla
    },
    input: {
        fontSize: 16,
        paddingVertical: 8,
        paddingHorizontal: 10,
        color: '#333', // Color del texto del input
    },
    underline: {
        borderBottomWidth: 1, // Añadir una línea inferior
        borderBottomColor: '#888', // Color de la línea inferior
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
    customButton: {
        backgroundColor: '#ff6347', // Cambiar color de fondo del botón
        borderRadius: 20, // Aumentar el radio de borde del botón
        marginVertical: 5, // Añadir margen vertical entre botones
    },
    customButtonText: {
        color: '#fff', // Cambiar color del texto del botón
        fontSize: 18, // Aumentar tamaño del texto del botón
    },
    customButtonContainer: {
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Cambiado a 'flex-start' para alinear a la izquierda
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 20, // Ajuste adicional para margen izquierdo
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