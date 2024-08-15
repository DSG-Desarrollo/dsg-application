import { Platform, StyleSheet } from 'react-native';
import theme from '../themes/theme';

const toolbarStyles = StyleSheet.create({
    safeArea: {
        backgroundColor: Platform.OS === 'ios' ? theme.colors.primary : undefined,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: Platform.OS === 'ios' ? theme.colors.primary : theme.colors.secondary,
        paddingHorizontal: 16,
        elevation: Platform.OS === 'android' ? 1 : 0,
        shadowColor: Platform.OS === 'ios' ? theme.colors.border : undefined,
        shadowOpacity: Platform.OS === 'ios' ? 0.3 : undefined,
        shadowRadius: Platform.OS === 'ios' ? 4 : undefined,
        shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    },
    iconContainer: {
        marginRight: 16,
    },
    title: {
        color: theme.colors.textPrimary, // Color de texto blanco
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default toolbarStyles;