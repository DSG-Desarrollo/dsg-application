import React, { useState, useRef, useEffect } from "react";
import { View, Pressable, Text, ToastAndroid, Dimensions } from "react-native";
import SelectManager from "../../../components/atoms/SelectManager";
import DrawableImage from "../../../components/molecules/DrawableImage";
import styles from "../../../styles/TabEquipmentLocationStyles";
import ApiService from "../../../services/api/ApiService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormCompletionTracker from "../../../components/atoms/FormCompletionTracker";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import ActionButtons from "../../../components/atoms/ActionButtons";

const options = [
  {
    label: "Vehículo liviano",
    value: "Vehículo liviano",
    image: require("../../../assets/images/vehiculo_liviano.jpg"),
  },
  {
    label: "Motocicleta",
    value: "Motocicleta",
    image: require("../../../assets/images/Yamaha-YZF-600R-Thundercat-1996-.png"),
  },
  { label: "Planta eléctrica", value: "Planta eléctrica" },
  { label: "Retro escavador", value: "Retro escavador" },
  { label: "Bocad", value: "Bocad" },
  {
    label: "Volqueta",
    value: "Volqueta",
    image: require("../../../assets/images/zil-mmz-585.png"),
  },
  {
    label: "Cabezal",
    value: "Cabezal",
    image: require("../../../assets/images/vehiculo_liviano.jpg"),
  },
  {
    label: "Grua",
    value: "Grua",
    image: require("../../../assets/images/scania-vabis-l-36-super.png"),
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

  const handleEdit = () => {
    // Implementar la lógica de editar aquí
  };

  const buttons = [
    {
      text: "Guardar",
      icon: faSave,
      onPress: handleSave,
    },
    {
      text: "Editar",
      icon: faEdit,
      onPress: handleEdit,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <SelectManager
          data={options}
          onValueChange={handleSelectOption}
          value={selectedOption ? selectedOption.value : null}
          placeholder={{ label: "Seleccionar opción", value: null }}
          pickerProps={{ inputAndroid: { color: "black" } }}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        />
      </View>

      <View style={styles.imageContainer}>
        {selectedOption && selectedOption.image && (
          <DrawableImage
            ref={drawableImageRef}
            fixedImageSource={selectedOption.image}
            strokeColor="red"
            strokeWidth={4}
            clearPaths={clearPaths}
            onPathsCleared={handleClearPaths}
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <ActionButtons
          buttons={buttons}
          buttonContainerStyle={styles.buttonContainer}
        />
      </View>
    </View>
  );
};

export default TabEquipmentLocation;
