// TabWorkOrderPhotos.js
import React, { useState } from "react";
import { View, Text, Modal, Pressable, ScrollView, ToastAndroid } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSave, faTruckLoading, faClipboardCheck, faCamera, faImage } from "@fortawesome/free-solid-svg-icons";
import * as ImagePicker from "expo-image-picker";
import EvidenceSection from "@components/molecules/EvidenceSection";
import CameraCaptureModal from "@components/molecules/CameraCaptureModal";
import { photo as styles, common as commonStyles } from "./styles";
import i18n from '@i18n/i18n';
import theme from '@themes/theme';
import { buttonStyles } from '@themes';

const { textPrimary } = theme.colors;
const { primary, primaryText } = buttonStyles;

const MAX_PHOTOS = 4;

const TabWorkOrderPhotos = ({ route }) => {
  const { tareaId, id_orden_trabajo, clienteId } = route.params;

  const [photos, setPhotos] = useState({ reception: [], delivery: [] });
  const [actionSheetSection, setActionSheetSection] = useState(null); // 'reception' | 'delivery' | null
  const [cameraSection, setCameraSection] = useState(null);

  const addPhotos = (section, newUris) => {
    setPhotos((prev) => {
      const current = prev[section];
      const room = MAX_PHOTOS - current.length;
      if (room <= 0) {
        ToastAndroid.show(`Ya alcanzaste el límite de ${MAX_PHOTOS} fotos`, ToastAndroid.SHORT);
        return prev;
      }
      const toAdd = newUris.slice(0, room);
      if (newUris.length > toAdd.length) {
        ToastAndroid.show(`Solo se agregaron ${toAdd.length} foto(s), llegaste al límite`, ToastAndroid.SHORT);
      }
      return { ...prev, [section]: [...current, ...toAdd] };
    });
  };

  const removePhoto = (section, index) => {
    setPhotos((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const handleAddPress = (section) => setActionSheetSection(section);

  const handlePickFromGallery = async () => {
    const section = actionSheetSection;
    setActionSheetSection(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      ToastAndroid.show("Se necesita permiso para acceder a la galería", ToastAndroid.LONG);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS,
    });
    if (!result.canceled) {
      addPhotos(section, result.assets.map((a) => a.uri));
    }
  };

  const handleOpenCamera = () => {
    const section = actionSheetSection;
    setActionSheetSection(null);
    setCameraSection(section);
  };

  const handlePictureTaken = (uri) => {
    if (cameraSection) addPhotos(cameraSection, [uri]);
    setCameraSection(null);
  };

  const handleSave = () => {
    // TODO: integrar con ApiService cuando definamos el endpoint
    // (formato sugerido: multipart/form-data con id_tarea, id_orden_trabajo,
    // y arrays de imágenes reception[] / delivery[])
    ToastAndroid.show("Evidencia lista para enviar (pendiente integrar API)", ToastAndroid.LONG);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollViewContent}>
      <EvidenceSection
        title="Evidencia de recepción"
        icon={faTruckLoading}
        instruction="Documenta golpes o daños visibles, el número de serie legible y los accesorios incluidos."
        photos={photos.reception}
        maxPhotos={MAX_PHOTOS}
        onAddPress={() => handleAddPress("reception")}
        onRemove={(index) => removePhoto("reception", index)}
      />

      <EvidenceSection
        title="Evidencia de entrega"
        icon={faClipboardCheck}
        instruction="Documenta la instalación terminada, las conexiones y la limpieza del área de trabajo."
        photos={photos.delivery}
        maxPhotos={MAX_PHOTOS}
        onAddPress={() => handleAddPress("delivery")}
        onRemove={(index) => removePhoto("delivery", index)}
      />
      </ScrollView>

      <Pressable style={primary} onPress={handleSave}>
        <FontAwesomeIcon icon={faSave} size={14} color={textPrimary} />
        <Text style={primaryText}>{i18n.t('ui:btnSave')}</Text>
      </Pressable>

      {/* Hoja de acción: tomar foto / elegir de galería */}
      <Modal
        visible={!!actionSheetSection}
        transparent
        animationType="fade"
        onRequestClose={() => setActionSheetSection(null)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setActionSheetSection(null)}>
          <View style={styles.sheetContainer}>
            <Pressable style={styles.sheetOption} onPress={handleOpenCamera}>
              <FontAwesomeIcon icon={faCamera} size={16} color="#555" />
              <Text style={styles.sheetOptionText}>Tomar foto</Text>
            </Pressable>
            <Pressable style={[styles.sheetOption, styles.sheetOptionLast]} onPress={handlePickFromGallery}>
              <FontAwesomeIcon icon={faImage} size={16} color="#555" />
              <Text style={styles.sheetOptionText}>Elegir de galería</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Cámara */}
      <Modal visible={!!cameraSection} animationType="slide">
        <CameraCaptureModal
          label={cameraSection === "reception" ? "Evidencia de recepción" : "Evidencia de entrega"}
          onCapture={handlePictureTaken}
          onClose={() => setCameraSection(null)}
        />
      </Modal>
    </View>
  );
};

export default TabWorkOrderPhotos;