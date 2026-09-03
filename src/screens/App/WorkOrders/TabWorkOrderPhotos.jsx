// TabWorkOrderPhotos.js
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, ToastAndroid, ActivityIndicator } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSave, faTruckLoading, faClipboardCheck, faCamera, faImage } from "@fortawesome/free-solid-svg-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EvidenceSection from "@components/molecules/EvidenceSection";
import CameraCaptureModal from "@components/molecules/CameraCaptureModal";
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import workOrderService from "@services/api/workorder.service";
import { photo as styles, common as commonStyles } from "./styles";
import i18n from '@i18n/i18n';
import theme from '@themes/theme';
import { buttonStyles } from '@themes';
import FullScreenModal from '@components/atoms/FullScreenModal';

const { textPrimary } = theme.colors;
const { primary, primaryText } = buttonStyles;

const MAX_PHOTOS = 4;

const TabWorkOrderPhotos = ({ route }) => {
  const { tareaId, id_orden_trabajo, clienteId } = route.params;

  const [photos, setPhotos] = useState({ reception: [], delivery: [] });
  const [actionSheetSection, setActionSheetSection] = useState(null); // 'reception' | 'delivery' | null
  const [cameraSection, setCameraSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("userData");
        setUserData(jsonValue ? JSON.parse(jsonValue) : null);
      } catch (e) {
        console.error("Error reading userData from storage", e);
      }
    };
    fetchUserData();
  }, []);

  const addPhotos = (section, newUris) => {
    setPhotos((prev) => {
      const current = prev[section];
      const room = MAX_PHOTOS - current.length;
      if (room <= 0) {
        ToastAndroid.show(
          i18n.t('workOrder:photosLimitReachedToast', { max: MAX_PHOTOS }),
          ToastAndroid.SHORT
        );
        return prev;
      }
      const toAdd = newUris.slice(0, room);
      if (newUris.length > toAdd.length) {
        ToastAndroid.show(
          i18n.t('workOrder:photosLimitPartialToast', { added: toAdd.length }),
          ToastAndroid.SHORT
        );
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
      ToastAndroid.show(i18n.t('workOrder:photosGalleryPermissionDenied'), ToastAndroid.LONG);
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

  const handleSave = async () => {
    console.log("handleSave");
    if (isSaving) return;

    if (photos.reception.length === 0 || photos.delivery.length === 0) {
      ToastAndroid.show(i18n.t('workOrder:photosMissingError'), ToastAndroid.LONG);
      return;
    }

    setIsSaving(true);

    try {
      const response = await workOrderService.uploadRevisionPhotos(id_orden_trabajo, {
        clientId: clienteId,
        taskId: tareaId,
        receptionPhotos: photos.reception,
        deliveryPhotos: photos.delivery,
      });

      if (response?.success) {
        ToastAndroid.show(i18n.t('workOrder:photosSaveSuccess'), ToastAndroid.LONG);

        if (userData?.employee?.id_usuario_empleado) {
          await FormCompletionTracker.markFormAsCompleted(
            "form_work_order_photos",
            clienteId,
            tareaId,
            id_orden_trabajo,
            userData.employee.id_usuario_empleado
          );
        }
      } else {
        console.log("else response", response);
        ToastAndroid.show(
          response?.error?.message || i18n.t('workOrder:photosSavePartial'),
          ToastAndroid.LONG
        );
      }
    } catch (error) {
      console.error("Error al guardar la evidencia fotográfica:", error);
      ToastAndroid.show(i18n.t('workOrder:photosSaveError'), ToastAndroid.LONG);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollViewContent}>
      <EvidenceSection
        title={i18n.t('workOrder:photosReceptionTitle')}
        icon={faTruckLoading}
        instruction={i18n.t('workOrder:photosReceptionInstruction')}
        photos={photos.reception}
        maxPhotos={MAX_PHOTOS}
        onAddPress={() => handleAddPress("reception")}
        onRemove={(index) => removePhoto("reception", index)}
      />

      <EvidenceSection
        title={i18n.t('workOrder:photosDeliveryTitle')}
        icon={faClipboardCheck}
        instruction={i18n.t('workOrder:photosDeliveryInstruction')}
        photos={photos.delivery}
        maxPhotos={MAX_PHOTOS}
        onAddPress={() => handleAddPress("delivery")}
        onRemove={(index) => removePhoto("delivery", index)}
      />
      </ScrollView>

      <Pressable
        style={[primary, isSaving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={textPrimary} />
        ) : (
          <FontAwesomeIcon icon={faSave} size={14} color={textPrimary} />
        )}
        <Text style={primaryText}>{i18n.t(isSaving ? 'ui:btnSaving' : 'ui:btnSave')}</Text>
      </Pressable>

      {/* Hoja de acción: tomar foto / elegir de galería */}
      <FullScreenModal
        visible={!!actionSheetSection}
        onClose={() => setActionSheetSection(null)}
        showToolbar={false}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setActionSheetSection(null)}>
          <View style={styles.sheetContainer}>
            <Pressable style={styles.sheetOption} onPress={handleOpenCamera}>
              <FontAwesomeIcon icon={faCamera} size={16} color="#555" />
              <Text style={styles.sheetOptionText}>{i18n.t('workOrder:photosTakePhoto')}</Text>
            </Pressable>
            <Pressable style={[styles.sheetOption, styles.sheetOptionLast]} onPress={handlePickFromGallery}>
              <FontAwesomeIcon icon={faImage} size={16} color="#555" />
              <Text style={styles.sheetOptionText}>{i18n.t('workOrder:photosPickFromGallery')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </FullScreenModal>

      {/* Cámara */}
      <FullScreenModal visible={!!cameraSection} showToolbar={false}>
        <CameraCaptureModal
          label={cameraSection === "reception"
            ? i18n.t('workOrder:photosReceptionTitle')
            : i18n.t('workOrder:photosDeliveryTitle')}
          onCapture={handlePictureTaken}
          onClose={() => setCameraSection(null)}
        />
      </FullScreenModal>
    </View>
  );
};

export default TabWorkOrderPhotos;