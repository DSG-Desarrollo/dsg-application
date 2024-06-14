import React, { useState, useRef, useEffect } from "react";
import { View, Modal, Pressable, Text, TextInput, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faEdit } from '@fortawesome/free-solid-svg-icons';
import SelectManager from '../../../components/atoms/SelectManager';
import DrawableImage from '../../../components/molecules/DrawableImage';
import styles from '../../../styles/TabEquipmentLocationStyles';
import ApiService from '../../../services/api/ApiService';
import FormCompletionTracker from '../../../components/atoms/FormCompletionTracker';

const options = [
    { label: 'Vehículo liviano', value: 'Vehículo liviano', image: require('../../../assets/images/vehiculo_liviano.jpg') },
    { label: 'Motocicleta', value: 'Motocicleta', image: require('../../../assets/images/Yamaha-YZF-600R-Thundercat-1996-.png') },
    { label: 'Planta eléctrica', value: 'Planta eléctrica' },
    { label: 'Retro escavador', value: 'Retro escavador' },
    { label: 'Bocad', value: 'Bocad' },
    { label: 'Volqueta', value: 'Volqueta', image: require('../../../assets/images/zil-mmz-585.png') },
    { label: 'Cabezal', value: 'Cabezal' },
    { label: 'Grua', value: 'Grua', image: require('../../../assets/images/scania-vabis-l-36-super.png') },
];

const TabEquipmentLocation = () => {
    const [showDrawableImage, setShowDrawableImage] = useState(false);
    const drawableImageRef = useRef(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [clearPaths, setClearPaths] = useState(false);

    const handleSelectOption = (value) => {
        const option = options.find(option => option.value === value);
        setSelectedOption(option);
        setClearPaths(true); // Trigger clearing the paths
    };

    const handleClearPaths = () => {
        setClearPaths(false); // Reset clearPaths after paths have been cleared
    };

    const handleSave = async () => {
        // Implementar la lógica de guardar aquí
        try {
            const apiService = new ApiService();

            if (drawableImageRef.current) {
                const base64Image = await drawableImageRef.current.captureCanvas();
                const formData = {
                    "id_tarea": 1,
                    "id_orden_trabajo": 1,
                    "image": base64Image,
                    "comentario_imagen": "Este es un comentario de prueba",
                    "usuario_creacion": 123
                };
                // Endpoint al que se enviarán los datos
                const endpoint = 'api/img-location-installation-ot';
                const response = await apiService.sendFormData(formData, endpoint);

                /*const { allCompleted, formStatuses } = await FormCompletionTracker.checkAllFormsCompleted(6669);
                console.log('Todos los formularios completos:', allCompleted);
                formStatuses.forEach(({ formKey, completed }) => {
                    console.log(`Formulario ${formKey} completado: ${completed}`);
                });
*/
                await FormCompletionTracker.markFormAsCompleted("form_equipment_location", 4434, 6669, 7);
                //console.log('Respuesta de la API:', response);
            } else {
                console.log("NULL");
            }
        } catch (error) {
            console.log('Error al capturar la imagen del lienzo:', error);
        }
    };

    useEffect(() => {
        setShowDrawableImage(true);
    }, []);

    const handleEdit = () => {
        // Implementar la lógica de editar aquí
    };

    return (
        <View style={styles.container}>
            <View style={styles.pickerContainer}>
                <SelectManager
                    data={options}
                    onValueChange={handleSelectOption}
                    value={selectedOption ? selectedOption.value : null}
                    placeholder={{ label: 'Seleccionar opción', value: null }}
                    pickerProps={{ inputAndroid: { color: 'black' } }}
                    style={{ color: '#333', paddingVertical: 10, paddingHorizontal: 15 }}
                    itemStyle={{ justifyContent: 'flex-start' }}
                />
            </View>
            <View style={styles.imageContainer}>
                {selectedOption && selectedOption.image && (
                    <DrawableImage
                        ref={drawableImageRef}
                        mode="dynamicImage"
                        dynamicImageSource={selectedOption.image}
                        strokeColor="red"
                        strokeWidth={4}
                        containerStyle={styles.fixedImageContainer}
                        imageStyle={styles.fixedImage}
                        clearPaths={clearPaths}
                        onPathsCleared={handleClearPaths}
                    />
                )}
            </View>
            <View style={styles.buttonContainer}>
                <Pressable onPress={handleSave} style={styles.button}>
                    <FontAwesomeIcon icon={faSave} size={30} color="#007bff" />
                    <Text style={styles.buttonText}>Guardar</Text>
                </Pressable>
                <Pressable onPress={handleEdit} style={styles.button}>
                    <FontAwesomeIcon icon={faEdit} size={30} color="#007bff" />
                    <Text style={styles.buttonText}>Editar</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default TabEquipmentLocation;
