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
import { useWorkOrderFormCompletion } from '@context/WorkOrderFormCompletionContext';
import WorkOrderRepository from '@repositories/WorkOrderRepository';
import useWorkOrderPhotos from '@hooks/useWorkOrderPhotos';
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
  const onFormCompleted = useWorkOrderFormCompletion();

  const [actionSheetSection, setActionSheetSection] = useState(null); // 'reception' | 'delivery' | null
  const [cameraSection, setCameraSection] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const workOrderRepository = WorkOrderRepository();

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

  // Offline-first: se lee siempre de SQLite local (local_path apunta a un archivo real
  // en el dispositivo — ver WorkOrderRepository/useWorkOrderPhotos). Si no hay nada
  // local todavía y hay conexión, el hook hidrata una vez desde el servidor.
  const { photos, setPhotos, isLoading: isLoadingPhotos, refetch: loadPhotos } =
    useWorkOrderPhotos(id_orden_trabajo, tareaId, clienteId);

  // 'staged' distingue una foto recién tomada/elegida en esta visita (todavía no tocó
  // SQLite ni la cola: vive solo en el estado de React, con la URI efímera del picker/
  // cámara) de una ya persistida localmente (guardada en esta visita o en una anterior,
  // remota o no) — remove/save la tratan distinto (ver removePhoto/handleSave).
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
      const toAdd = newUris.slice(0, room).map((uri) => ({ id: uri, uri, remote: false, staged: true }));
      if (newUris.length > toAdd.length) {
        ToastAndroid.show(
          i18n.t('workOrder:photosLimitPartialToast', { added: toAdd.length }),
          ToastAndroid.SHORT
        );
      }
      return { ...prev, [section]: [...current, ...toAdd] };
    });
  };

  // Una foto 'staged' (recién tomada/elegida en esta visita) nunca tocó SQLite ni la
  // cola: quitarla solo actualiza el estado local, como antes. Una ya persistida
  // (remota o local sin sincronizar todavía) usa removeLocalPhoto, que es offline-first
  // (SPEC.md §32/§13): local o pendiente sin subir -> se borra ya y se cancela la
  // subida en cola si la había; ya remota -> tombstone local + cola 'photo_delete'. En
  // ambos casos la escritura local es inmediata y no depende de la red, así que ya no
  // hace falta el revert-on-failure que tenía el flujo online-only anterior.
  const removePhoto = async (section, photo) => {
    setPhotos((prev) => ({
      ...prev,
      [section]: prev[section].filter((p) => p.id !== photo.id),
    }));

    if (photo.staged) return;

    try {
      await workOrderRepository.removeLocalPhoto(photo.id);
    } catch (error) {
      console.error("Error al eliminar la foto de evidencia:", error);
      ToastAndroid.show(i18n.t('workOrder:photosDeleteError'), ToastAndroid.LONG);
      setPhotos((prev) => ({
        ...prev,
        [section]: [...prev[section], photo],
      }));
    }
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
    if (isSaving) return;

    if (photos.reception.length === 0 || photos.delivery.length === 0) {
      ToastAndroid.show(i18n.t('workOrder:photosMissingError'), ToastAndroid.LONG);
      return;
    }

    // Las fotos ya persistidas (remotas o locales de una visita anterior) no se vuelven
    // a procesar; solo las 'staged' de esta visita (recién tomadas/elegidas).
    const stagedReception = photos.reception.filter((p) => p.staged);
    const stagedDelivery = photos.delivery.filter((p) => p.staged);

    setIsSaving(true);

    try {
      // Offline-first: cada foto escribe su archivo local YA (funciona sin conexión) y
      // encola su propia subida — SyncManager la manda a POST .../photos en cuanto hay
      // conexión (ver WorkOrderRepository.addLocalPhoto). "Guardado" ya no depende de
      // que el POST al servidor termine, igual que el resto de los tabs offline-first.
      for (const photo of stagedReception) {
        await workOrderRepository.addLocalPhoto(tareaId, id_orden_trabajo, clienteId, "reception", photo.uri);
      }
      for (const photo of stagedDelivery) {
        await workOrderRepository.addLocalPhoto(tareaId, id_orden_trabajo, clienteId, "delivery", photo.uri);
      }

      // Reemplaza las entradas 'staged' (URI efímera del picker) por las persistidas
      // localmente (con su id de SQLite, estable entre sesiones).
      await loadPhotos();

      ToastAndroid.show(i18n.t('workOrder:photosSaveSuccess'), ToastAndroid.LONG);

      if (userData?.employee?.id_usuario_empleado) {
        await FormCompletionTracker.markFormAsCompleted(
          "form_work_order_photos",
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
      {isLoadingPhotos ? (
        <ActivityIndicator size="small" color={textPrimary} style={styles.loadingIndicator} />
      ) : (
        <>
          <EvidenceSection
            title={i18n.t('workOrder:photosReceptionTitle')}
            icon={faTruckLoading}
            instruction={i18n.t('workOrder:photosReceptionInstruction')}
            photos={photos.reception}
            maxPhotos={MAX_PHOTOS}
            onAddPress={() => handleAddPress("reception")}
            onRemove={(photo) => removePhoto("reception", photo)}
          />

          <EvidenceSection
            title={i18n.t('workOrder:photosDeliveryTitle')}
            icon={faClipboardCheck}
            instruction={i18n.t('workOrder:photosDeliveryInstruction')}
            photos={photos.delivery}
            maxPhotos={MAX_PHOTOS}
            onAddPress={() => handleAddPress("delivery")}
            onRemove={(photo) => removePhoto("delivery", photo)}
          />
        </>
      )}
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