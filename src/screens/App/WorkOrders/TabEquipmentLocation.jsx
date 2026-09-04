import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable, ToastAndroid, ActivityIndicator } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import DrawableImage from "@components/molecules/DrawableImage";
import { location as styles } from "./styles";
import workOrderService from "@services/api/workorder.service";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import { useWorkOrderFormCompletion } from '@context/WorkOrderFormCompletionContext';
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
  const onFormCompleted = useWorkOrderFormCompletion();
  const [showDrawableImage, setShowDrawableImage] = useState(false);
  const drawableImageRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState(null);
  // Imagen base que se le pasa al lienzo (fixedImageSource): puede ser el asset local
  // del tipo de equipo elegido, o la imagen ya guardada en el backend (recuperada al
  // entrar al tab, para el flujo de edición).
  const [canvasImageSource, setCanvasImageSource] = useState(null);
  const [clearPaths, setClearPaths] = useState(false);
  // Mientras se consulta si la OT ya tiene una imagen de ubicación guardada. El fetch
  // es una petición de red, así que mostramos un loader para que el usuario no piense
  // que el lienzo está vacío por defecto mientras en realidad se está recuperando algo.
  const [isLoadingSavedImage, setIsLoadingSavedImage] = useState(true);

  // Recuperar la imagen de ubicación ya guardada para esta OT (si existe) al montar el
  // tab, para no partir siempre de un lienzo en blanco al reabrir en modo edición.
  useEffect(() => {
    let isMounted = true;

    const fetchSavedImage = async () => {
      try {
        const response = await workOrderService.getEquipmentLocationImage(id_orden_trabajo);
        const saved = response?.data;
        if (isMounted && saved?.image_url) {
          setCanvasImageSource(saved.image_url);

          // Preseleccionar el chip del tipo de equipo usado originalmente, si el
          // registro lo tiene guardado (registros guardados antes de este cambio
          // no lo tendrán, y el chip simplemente queda sin marcar).
          const matchingOption = options.find((option) => option.value === saved.tipo_equipo);
          if (matchingOption) {
            setSelectedOption(matchingOption);
          }
        }
      } catch (error) {
        console.log("Error al recuperar la imagen de ubicación guardada:", error);
      } finally {
        if (isMounted) {
          setIsLoadingSavedImage(false);
        }
      }
    };

    fetchSavedImage();
    return () => {
      isMounted = false;
    };
  }, [id_orden_trabajo]);

  const handleSelectOption = (value) => {
    const option = options.find((option) => option.value === value);
    setSelectedOption(option);
    setCanvasImageSource(option.image);
    setClearPaths(true); // Trigger clearing the paths
  };

  const handleClearPaths = () => {
    setClearPaths(false); // Reset clearPaths after paths have been cleared
  };

  // Deja el lienzo en blanco: mismo tipo de equipo elegido, pero sin ninguna marca
  // (a diferencia de deshacer, que retrocede trazo por trazo). Si aún no se ha elegido
  // un tipo de equipo (solo se ve la imagen recuperada del backend), no hay un asset
  // "limpio" al cual volver, así que solo se limpian los trazos de esta sesión.
  const handleBlankCanvas = () => {
    if (selectedOption) {
      setCanvasImageSource(selectedOption.image);
    }
  };

  const handleSave = async () => {
    try {
      if (!drawableImageRef.current) {
        console.log("DrawableImage reference is null");
        return;
      }

      const base64Image = await drawableImageRef.current.captureCanvas();
      const idOrdenTrabajoInt = parseInt(id_orden_trabajo, 10);

      const response = await workOrderService.saveEquipmentLocationImage(idOrdenTrabajoInt, {
        taskId: tareaId,
        userId: userData?.id_usuario,
        image: base64Image,
        equipmentType: selectedOption?.value,
        comment: "Este es un comentario de prueba",
      });
      console.log('Respuesta de la API:', response);

      if (userData?.employee?.id_usuario_empleado) {
        await FormCompletionTracker.markFormAsCompleted(
          "form_equipment_location",
          clienteId,
          tareaId,
          id_orden_trabajo,
          userData.employee.id_usuario_empleado
        );
        onFormCompleted?.();
      } else {
        console.warn("No se pudo marcar el formulario como completado: userData aún no está disponible.");
      }

      ToastAndroid.show("Imagen guardada", ToastAndroid.LONG);
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
        {isLoadingSavedImage ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={borderStrong} />
            <Text style={styles.emptyStateText}>
              {i18n.t('workOrder:equipmentLocationLoadingSaved')}
            </Text>
          </View>
        ) : canvasImageSource ? (
          <DrawableImage
            ref={drawableImageRef}
            fixedImageSource={canvasImageSource}
            strokeColor="red"
            strokeWidth={4}
            clearPaths={clearPaths}
            onPathsCleared={handleClearPaths}
            onBlankCanvas={handleBlankCanvas}
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
