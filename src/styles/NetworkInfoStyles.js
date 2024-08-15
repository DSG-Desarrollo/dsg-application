// NetworkInfoStyles.js

import { StyleSheet } from 'react-native';
import theme from '../themes/theme';

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
        backgroundColor: theme.colors.danger, // Utiliza el color de peligro de la paleta
    },
    successContainer: {
        backgroundColor: theme.colors.success, // Utiliza el color de éxito de la paleta
    },
    errorText: {
        color: theme.colors.textPrimary, // Texto blanco para mejor legibilidad
    },
    statusTextContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusText: {
        marginVertical: 4,
        color: theme.colors.textPrimary, // Texto blanco para mejor legibilidad
    },
});

export default NetworkInfoStyles;
