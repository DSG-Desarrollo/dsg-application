import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Pressable, ToastAndroid, ActivityIndicator } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import DrawableImage from "@components/molecules/DrawableImage";
import { location as styles } from "./styles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import { useWorkOrderFormCompletion } from '@context/WorkOrderFormCompletionContext';
import { faSave, faImage } from "@fortawesome/free-solid-svg-icons";
import i18n from '@i18n/i18n';
import theme from '@themes/theme';
import { buttonStyles } from '@themes';
import WorkOrderRepository from '@repositories/WorkOrderRepository';
import useEquipmentLocationImage from '@hooks/useEquipmentLocationImage';
import useTicketCompletion from '@hooks/useTicketCompletion';

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
  {
    label: "Planta eléctrica",
    value: "Planta eléctrica",
    image: require("@assets/images/planta_electrica.jpg"),
  },
  {
    label: "Retro escavador",
    value: "Retro escavador",
    image: require("@assets/images/retroexcavadora.jpg"),
  },
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
  const [isSaving, setIsSaving] = useState(false);

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
  const workOrderRepository = WorkOrderRepository();
  // Offline-first (misma fuente que WorkOrderRepository.completeTicket, sin endpoint
  // propio): una vez que el ticket quedó completado, esta OT pasa a solo lectura para no
  // pisar datos que el técnico ya cerró.
  const { isCompleted: isTicketCompleted } = useTicketCompletion(tareaId);
  const [showDrawableImage, setShowDrawableImage] = useState(false);
  const drawableImageRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState(null);
  // Imagen base que se le pasa al lienzo (fixedImageSource): puede ser el asset local
  // del tipo de equipo elegido, o la imagen ya guardada (local_image_path — un archivo
  // real en el dispositivo, ver useEquipmentLocationImage/WorkOrderRepository).
  const [canvasImageSource, setCanvasImageSource] = useState(null);
  const [clearPaths, setClearPaths] = useState(false);
  // Trazos de esta sesión de edición, guardados por tipo de equipo (chip), para poder
  // alternar entre tipos sin perder lo ya dibujado en cada uno — solo se pisan cuando el
  // usuario los borra a propósito (goma) o nunca dibujó nada en ese tipo. No es estado de
  // React a propósito: no necesita disparar un render, solo persistir entre selecciones.
  const pathsByOptionRef = useRef({});

  // Offline-first: se lee siempre de SQLite local (local_image_path apunta a un archivo
  // real en el dispositivo). Si es la primera vez que se abre esta OT en este
  // dispositivo y hay conexión, el hook hidrata una vez desde el servidor; si ya hay
  // algo local (sincronizado o pendiente), nunca se pisa.
  const { record: savedImage, isLoading: isLoadingSavedImage } = useEquipmentLocationImage(id_orden_trabajo, tareaId);

  useEffect(() => {
    if (!savedImage?.local_image_path) {
      return;
    }

    setCanvasImageSource(savedImage.local_image_path);

    // Preseleccionar el chip del tipo de equipo usado originalmente, si el registro lo
    // tiene guardado (registros guardados antes de este cambio no lo tendrán, y el chip
    // simplemente queda sin marcar).
    const matchingOption = options.find((option) => option.value === savedImage.tipo_equipo);
    if (matchingOption) {
      setSelectedOption(matchingOption);
    }
  }, [savedImage]);

  const handleSelectOption = (value) => {
    if (isTicketCompleted) return;

    const option = options.find((option) => option.value === value);

    // Antes de cambiar de tipo, guarda los trazos del tipo que se estaba editando —
    // así, si el usuario vuelve a elegirlo más tarde en esta misma sesión, se
    // restauran en vez de perderse.
    if (selectedOption && drawableImageRef.current) {
      pathsByOptionRef.current[selectedOption.value] = drawableImageRef.current.getPaths();
    }

    setSelectedOption(option);
    setCanvasImageSource(option.image);

    const savedPaths = pathsByOptionRef.current[option.value];
    if (savedPaths && savedPaths.length > 0) {
      // Ya había trazos guardados para este tipo (de esta misma sesión): se restauran.
      drawableImageRef.current?.restorePaths(savedPaths);
    } else {
      // Tipo nunca dibujado (o ya borrado a propósito con la goma): lienzo limpio.
      setClearPaths(true);
    }
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
    if (isSaving || isTicketCompleted) return;

    try {
      if (!drawableImageRef.current) {
        console.log("DrawableImage reference is null");
        return;
      }

      setIsSaving(true);

      const base64Image = await drawableImageRef.current.captureCanvas();
      const idOrdenTrabajoInt = parseInt(id_orden_trabajo, 10);

      // Offline-first: escribe el archivo local YA (funciona sin conexión) y encola el
      // envío a POST /img-location-installation-ot (SyncManager lo manda en cuanto hay
      // conexión, ver WorkOrderRepository.saveEquipmentLocationImage).
      await workOrderRepository.saveEquipmentLocationImage(tareaId, idOrdenTrabajoInt, {
        userId: userData?.id_usuario,
        image: base64Image,
        equipmentType: selectedOption?.value,
        comment: "Este es un comentario de prueba",
      });

      if (userData?.employee?.id_usuario_empleado) {
        await FormCompletionTracker.markFormAsCompleted(
          "form_equipment_location",
          clienteId,
          tareaId,
          id_orden_trabajo,
          userData.employee.id_usuario_empleado,
          () => workOrderRepository.startWorkOrder(tareaId, id_orden_trabajo, {
            userId: userData.employee.id_usuario_empleado,
            clienteId,
          })
        );
        onFormCompleted?.();
      } else {
        console.warn("No se pudo marcar el formulario como completado: userData aún no está disponible.");
      }

      ToastAndroid.show("Imagen guardada", ToastAndroid.LONG);
    } catch (error) {
      console.error("Error al guardar la imagen de ubicación:", error);
      ToastAndroid.show("No se pudo guardar la imagen.", ToastAndroid.LONG);
    } finally {
      setIsSaving(false);
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
              style={[styles.chip, isSelected && styles.chipSelected, isTicketCompleted && { opacity: 0.6 }]}
              onPress={() => handleSelectOption(option.value)}
              disabled={isTicketCompleted}
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
          // pointerEvents="none" bloquea también los botones propios de DrawableImage
          // (deshacer/rehacer/goma) sin necesitar tocar su implementación interna.
          <View pointerEvents={isTicketCompleted ? "none" : "auto"} style={{ flex: 1, flexDirection: "row" }}>
            <DrawableImage
              ref={drawableImageRef}
              fixedImageSource={canvasImageSource}
              strokeColor="red"
              strokeWidth={4}
              clearPaths={clearPaths}
              onPathsCleared={handleClearPaths}
              onBlankCanvas={handleBlankCanvas}
            />
          </View>
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

      {!isTicketCompleted && (
        <View style={styles.saveContainer}>
          <Pressable
            style={[primary, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={textInverse} />
            ) : (
              <FontAwesomeIcon icon={faSave} size={16} color={textInverse} />
            )}
            <Text style={primaryText}>{i18n.t(isSaving ? 'ui:btnSaving' : 'ui:btnSave')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default TabEquipmentLocation;
