// TicketDetailScreenStyles.js
import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

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
        backgroundColor: '#4CAF50',
        color: '#FFFFFF',
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
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
    },
    value: {
        flex: 1,
    },
    info: {
        marginBottom: 4,
    },
    itemRow: {
        flexDirection: 'row', // Cambiar la dirección de flexión a 'row'
        alignItems: 'center',
        marginBottom: 4,
    },
    labelList: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        marginRight: 4,
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
        fontSize: RFValue(10),
    },
});

export default style;
