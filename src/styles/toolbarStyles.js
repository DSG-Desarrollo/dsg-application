import { Platform, StyleSheet } from 'react-native';

const toolbarStyles = StyleSheet.create({
    safeArea: {
        backgroundColor: Platform.OS === 'ios' ? '#0045AD' : undefined, // Aplicar color de fondo solo en iOS
    },
    safeAreaIOS: {
        flex: 0, // Asegurar que SafeAreaView no ocupe todo el espacio disponible en iOS
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        backgroundColor: '#0045AD',
        paddingHorizontal: 16,
        elevation: Platform.OS === 'android' ? 1 : 0, // Solo aplica elevación en Android
        shadowColor: Platform.OS === 'ios' ? '#000' : undefined, // Solo aplica sombra en iOS
        shadowOpacity: Platform.OS === 'ios' ? 0.3 : undefined,
        shadowRadius: Platform.OS === 'ios' ? 4 : undefined,
        shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    },
    containerIOS: {
        backgroundColor: '#007AFF', // Color de fondo diferente para iOS
    },
    iconContainer: {
        marginRight: 16,
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
});

export default toolbarStyles;
