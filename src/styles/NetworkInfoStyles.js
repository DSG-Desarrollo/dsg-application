// NetworkInfoStyles.js

import { StyleSheet } from 'react-native';

const NetworkInfoStyles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    innerContainer: {
        padding: 10,
        marginBottom: 0,
    },
    errorContainer: {
        backgroundColor: '#FF6666', // Rojo intenso para indicar error
    },
    successContainer: {
        backgroundColor: '#66CC66', // Verde intenso para indicar conexión exitosa
    },
    errorText: {
        color: 'white',
    },
    statusTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusText: {
        marginVertical: 4,
        color: 'white', // Texto blanco para mejor legibilidad
    },
});

export default NetworkInfoStyles;
