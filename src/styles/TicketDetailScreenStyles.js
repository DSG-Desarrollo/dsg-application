// TicketDetailScreenStyles.js
import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import theme from '../themes/theme';

const style = StyleSheet.create({
    section: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    sectionContent: {
        fontFamily: 'Roboto',
        fontSize: 15,
        backgroundColor: theme.colors.primary,
        color: theme.colors.textPrimary,
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        marginBottom: 10,
        textAlign: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'white',
    },
    icon: {
        marginRight: 12,
    },
    field: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingLeft: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    ordersContainer: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    orderItem: {
        marginBottom: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        flexDirection: 'row', // Para alinear el icono y los textos horizontalmente
        padding: 0,
        marginVertical: 0,
    },
    value: {
        flex: 1,
    },
    info: {
        marginBottom: 4,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Distribuye el espacio entre el icono y los textos
      },
    labelList: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        marginRight: 4,
    },
    textContainer: {
        flex: 1,
        marginLeft: 8, // Espacio entre el icono y los textos
    },
    textLine: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Espacio entre el label y el info
        alignItems: 'center',
        marginBottom: 4, // Espacio entre líneas de texto
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
    },
    noDataText: {
        fontSize: 16,
        color: '#6b6b6b',
        textAlign: 'center',
        marginTop: 20,
    },
    dynamicFontSize: {
        fontSize: RFValue(12),
    },
    textWhite: {
        color: '#FFFFFF',
    },
});

export default style;
