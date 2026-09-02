import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable, ToastAndroid } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import DrawableImage from "@components/molecules/DrawableImage";
import { location as styles } from "./styles";
import ApiService from "@services/api/ApiService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import { faSave, faImage } from "@fortawesome/free-solid-svg-icons";
import i18n from '@i18n/i18n';
import theme from '@themes/theme';
import { buttonStyles } from '@themes';

const { textMuted, textInverse, borderStrong } = theme.colors;
const { primary, primaryText } = buttonStyles;

const options = [
  {
    label: "Vehículo liviano",
    value: "Vehículo liviano",
    image: require("@assets/images/vehiculo_liviano.jpg"),
  },
  {
    label: "Motocicleta",
    value: "Motocicleta",
    image: require("@assets/images/Yamaha-YZF-600R-Thundercat-1996-.png"),
  },
  { label: "Planta eléctrica", value: "Planta eléctrica" },
  { label: "Retro escavador", value: "Retro escavador" },
  { label: "Bocad", value: "Bocad" },
  {
    label: "Volqueta",
    value: "Volqueta",
    image: require("@assets/images/zil-mmz-585.png"),
  },
  {
    label: "Cabezal",
    value: "Cabezal",
    image: require("@assets/images/vehiculo_liviano.jpg"),
  },
  {
    label: "Grua",
    value: "Grua",
    image: require("@assets/images/scania-vabis-l-36-super.png"),
  },
];

const TabEquipmentLocation = ({ route }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userData');
        setUserData(jsonValue ? JSON.parse(jsonValue) : null);
      } catch (e) {
        console.error("Error reading userData from storage", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  const {
    tareaId,
    id_orden_trabajo,
    id_servicio_cliente,
    id_unidad,
    clienteId,
  } = route.params;
  const [showDrawableImage, setShowDrawableImage] = useState(false);
  const drawableImageRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [clearPaths, setClearPaths] = useState(false);

  const handleSelectOption = (value) => {
    const option = options.find((option) => option.value === value);
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
        let idOrdenTrabajoInt = parseInt(id_orden_trabajo, 10);
        const formData = {
          id_tarea: tareaId,
          id_orden_trabajo: idOrdenTrabajoInt,
          comentario_imagen: "Este es un comentario de prueba",
          usuario_creacion: userData.id_usuario,
          image: base64Image,
        };
        //console.log(base64Image);
        // Endpoint al que se enviarán los datos
        const endpoint = "api/img-location-installation-ot";
        const response = await apiService.sendFormData(formData, endpoint);
        console.log('Respuesta de la API:', response);

        await FormCompletionTracker.markFormAsCompleted(
          "form_equipment_location",
          clienteId,
          tareaId,
          id_orden_trabajo,
          userData.employee.id_usuario_empleado
        );
        //console.log('Respuesta de la API:', response);

        ToastAndroid.show("Imagen guardada", ToastAndroid.LONG);

      } else {
        console.log("DrawableImage reference is null");
      }
    } catch (error) {
      console.log("Error al capturar la imagen del lienzo:", error);
    }
  };

  useEffect(() => {
    setShowDrawableImage(true);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>
        {i18n.t('workOrder:equipmentLocationTypeLabel')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.chipRow}
      >
        {options.map((option) => {
          const isSelected = selectedOption?.value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => handleSelectOption(option.value)}
            >
              <View
                style={[styles.chipThumb, isSelected && styles.chipThumbSelected]}
              >
                {option.image ? (
                  <Image source={option.image} style={styles.chipThumbImage} />
                ) : (
                  <FontAwesomeIcon
                    icon={faImage}
                    size={16}
                    color={isSelected ? textInverse : textMuted}
                  />
                )}
              </View>
              <Text
                style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
                numberOfLines={2}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.canvasCard}>
        {selectedOption && selectedOption.image ? (
          <DrawableImage
            ref={drawableImageRef}
            fixedImageSource={selectedOption.image}
            strokeColor="red"
            strokeWidth={4}
            clearPaths={clearPaths}
            onPathsCleared={handleClearPaths}
          />
        ) : (
          <View style={styles.emptyState}>
            <FontAwesomeIcon icon={faImage} size={40} color={borderStrong} />
            <Text style={styles.emptyStateText}>
              {selectedOption
                ? i18n.t('workOrder:equipmentLocationNoImage')
                : i18n.t('workOrder:equipmentLocationSelectPrompt')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.saveContainer}>
        <Pressable style={primary} onPress={handleSave}>
          <FontAwesomeIcon icon={faSave} size={16} color={textInverse} />
          <Text style={primaryText}>{i18n.t('ui:btnSave')}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default TabEquipmentLocation;
