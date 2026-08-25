// components/molecules/CameraCaptureModal.js
import React, { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTimes, faBolt, faCameraRotate, faBan } from "@fortawesome/free-solid-svg-icons";
import theme from '@themes/theme';

const CameraCaptureModal = ({ label, onCapture, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [flash, setFlash] = useState("off");
  const cameraRef = useRef(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionContainer]}>
        <Text style={styles.permissionText}>
          Necesitamos acceso a la cámara para tomar la foto.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Dar permiso</Text>
        </Pressable>
        <Pressable onPress={onClose} style={{ marginTop: 12 }}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    onCapture(photo.uri);
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
      />

      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={onClose}>
          <FontAwesomeIcon icon={faTimes} size={16} color="#fff" />
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={() => setFlash((f) => (f === "off" ? "on" : "off"))}
        >
          <FontAwesomeIcon icon={flash === "off" ? faBan : faBolt} size={16} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.labelWrap}>
        <Text style={styles.labelText}>{label}</Text>
      </View>

      <View style={styles.bottomBar}>
        <View style={{ width: 36 }} />
        <Pressable style={styles.shutterOuter} onPress={handleCapture}>
          <View style={styles.shutterInner} />
        </Pressable>
        <Pressable
          style={styles.iconButtonSmall}
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
        >
          <FontAwesomeIcon icon={faCameraRotate} size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  permissionContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: theme.colors.surface,
  },

  permissionText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },

  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  permissionButtonText: {
    color: theme.colors.textInverse,
    fontSize: 14,
    fontWeight: "600",
  },

  cancelText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },

  topBar: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 63, 117, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },

  iconButtonSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 63, 117, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },

  labelWrap: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
  },

  labelText: {
    color: theme.colors.textInverse,
    fontSize: 12,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },

  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },

  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: theme.colors.textInverse,
    alignItems: "center",
    justifyContent: "center",
  },

  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.textInverse,
  },
});

export default CameraCaptureModal;