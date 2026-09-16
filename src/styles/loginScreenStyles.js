import { StyleSheet } from 'react-native';

export const createLoginScreenStyles = (colors) => StyleSheet.create({
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
        color: colors.textSecondary,
    },
    link: {
        fontWeight: 'bold',
        color: colors.primary,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rememberText: {
        fontSize: 14,
        marginRight: 5,
        color: colors.text,
    },
});

export default createLoginScreenStyles;
