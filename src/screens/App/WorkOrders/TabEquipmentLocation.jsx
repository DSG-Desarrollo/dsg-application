import React, { useState, useRef } from "react";
import { View, Modal, Pressable, Text, TextInput, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faEdit } from '@fortawesome/free-solid-svg-icons';
import SelectManager from '../../../components/atoms/SelectManager';
import DrawableImage from '../../../components/molecules/DrawableImage';
import styles from '../../../styles/TabEquipmentLocationStyles';

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
            if (drawableImageRef.current) {
                const base64Image = await drawableImageRef.current.captureCanvas();

            } else {
                
            }
        } catch (error) {
            console.log('Error al capturar la imagen del lienzo:', error);
        }
    };

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
