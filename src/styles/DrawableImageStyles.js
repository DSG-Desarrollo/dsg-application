import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({

    container: {
        flex: 1,
        flexDirection: 'row',
    },
    canvas: {
        width: '100%', // Ocupa todo el ancho disponible del contenedor
        height: '100%', // Ocupa todo el alto disponible del contenedor
    },
    canvasContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: '#ccc',
    },
    canvasBorder: {
        borderWidth: 2,
        borderColor: 'black',
    },
    canvasPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    placeholderText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sideButtonsContainer: {
        alignItems: 'flex-end',
        marginRight: 16,
    },
    button: {
        padding: 10,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#F5F5F5',
    },
    undoButton: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    redoButton: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    colorPickerButton: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Para darle un fondo semi-transparente al modal
    },
    pickerContainer: {
        width: 300,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    panelStyle: {
        height: 150,
        width: 250,
        marginBottom: 20,
    },
    sliderStyle: {
        width: 250,
        height: 40,
        marginBottom: 20,
    },
    swatchesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 250,
        marginBottom: 20,
    },
    swatchStyle: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    previewTxtContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    closeButton: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default styles;