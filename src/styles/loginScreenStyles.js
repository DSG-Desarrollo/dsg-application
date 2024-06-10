import { StyleSheet } from 'react-native';
import { theme } from '../core/theme';

const loginScreenStyles = StyleSheet.create({
    forgotPassword: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        marginTop: 4,
    },
    forgotRememberContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    forgot: {
        fontSize: 13,
        color: theme.colors.secondary,
    },
    link: {
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberText: {
        fontSize: 14,
        marginRight: 5,
    },
});

export default loginScreenStyles;