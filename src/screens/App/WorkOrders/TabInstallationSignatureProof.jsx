import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  ToastAndroid,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Text,
  Pressable,
  Dimensions,
  StyleSheet,
} from "react-native";
import { faSave, faEraser, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import DrawableImage from "@components/molecules/DrawableImage";
import Card from "@components/molecules/Card";
import ApiService from "@services/api/ApiService";
import FormValidation from "@components/molecules/FormValidation";
import SegmentedToggle from "@components/atoms/SegmentedToggle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signature as styles } from "./styles";
import { buttonStyles } from '@themes';
import theme from '@themes/theme';

import i18n from '@i18n/i18n';

const { primary, primaryText, outline, outlineText } = buttonStyles;
const { info, infoText } = theme.colors;

const { width: screenWidth } = Dimensions.get("window");
const canvasSize = screenWidth * 0.86; // ligeramente menor para dejar margen del Card

const SIGNATURE_MODE_OPTIONS = [
  { value: "dibujada", label: "Firma" },
  { value: "escrita", label: "Escribir nombre" },
];

const TabInstallationSignatureProof = ({ route }) => {
  const [userData, setUserData] = useState(null);
  const { tareaId, id_orden_trabajo, clienteId } = route.params;
  const [showDrawableImage, setShowDrawableImage] = useState(false);
  const [clearPaths, setClearPaths] = useState(false);
  const [signatureMode, setSignatureMode] = useState("dibujada");
  const drawableImageRef = useRef(null);

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

  useEffect(() => {
    setShowDrawableImage(true);
  }, []);

  const initialValues = { nombre_firma_cliente: "" };
  const validationInput = [
    {
      key: "nombre_firma_cliente",
      type: "string",
      min: 3,
      message: "El nombre es obligatorio y debe tener al menos 3 caracteres",
    },
  ];

  const handlePathsCleared = () => setClearPaths(false);

  const handleSave = async (values) => {
    try {
      const isDrawMode = signatureMode === "dibujada";

      if (isDrawMode && !drawableImageRef.current) {
        return;
      }

      const apiService = new ApiService();
      const formData = {
        id_tarea: tareaId,
        id_orden_trabajo: id_orden_trabajo,
        nombre_firma_cliente: values.nombre_firma_cliente,
        tipo_firma: signatureMode,
        image: isDrawMode ? await drawableImageRef.current.captureCanvas() : null,
      };

      const response = await apiService.sendFormData(formData, "api/client-signature");

      if (response.status === 200 && response.statusText === "OK") {
        ToastAndroid.showWithGravity(
          response.message || "Registro actualizado exitosamente",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM
        );
        await FormCompletionTracker.markFormAsCompleted(
          "form_installation_signature_proof",
          clienteId,
          tareaId,
          id_orden_trabajo,
          userData.employee.id_usuario_empleado
        );
      } else {
        ToastAndroid.showWithGravity(
          response.message || "Hubo un problema al actualizar el registro",
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM
        );
      }
    } catch (error) {
      ToastAndroid.showWithGravity(
        "Hubo un problema al actualizar el registro.",
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
      console.error("Error al guardar los datos:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <FormValidation
          initialValues={initialValues}
          validationInput={validationInput}
          onSubmit={handleSave}
        >
          {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
            <Card title="Firma de conformidad" style={styles.formCard}>
              <View style={localStyles.infoBanner}>
                <FontAwesomeIcon icon={faInfoCircle} size={15} color={info} style={localStyles.infoIcon} />
                <Text style={localStyles.infoText}>
                  Esta firma certifica que el cliente recibió el trabajo.
                </Text>
              </View>

              <SegmentedToggle
                options={SIGNATURE_MODE_OPTIONS}
                value={signatureMode}
                onChange={setSignatureMode}
              />

              {signatureMode === "dibujada" ? (
                <>
                  <View style={styles.imageContainer}>
                    {showDrawableImage && (
                      <DrawableImage
                        ref={drawableImageRef}
                        blankCanvas={true}
                        strokeColor="black"
                        strokeWidth={4}
                        clearPaths={clearPaths}
                        onPathsCleared={handlePathsCleared}
                        containerStyle={[
                          styles.canvasContainer,
                          { width: canvasSize, height: canvasSize },
                        ]}
                        imageStyle={styles.fixedImage}
                      />
                    )}
                  </View>
                </>
              ) : (
                <View style={styles.signatureContainer}>
                  <Text style={styles.fieldLabel}>Firma escrita (nombre completo)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.underline,
                      touched.nombre_firma_cliente && errors.nombre_firma_cliente
                        ? styles.inputError
                        : null,
                    ]}
                    onChangeText={handleChange("nombre_firma_cliente")}
                    onBlur={handleBlur("nombre_firma_cliente")}
                    value={values.nombre_firma_cliente}
                    placeholder="Ej. Jane Doe"
                    placeholderTextColor="#aaa"
                    underlineColorAndroid="transparent"
                  />
                </View>
              )}

              {touched.nombre_firma_cliente && errors.nombre_firma_cliente && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errors.nombre_firma_cliente}</Text>
                </View>
              )}

              <Pressable style={localStyles.button} onPress={handleSubmit}>
                <FontAwesomeIcon icon={faSave} size={16} color="#ffffff" />
                <Text style={primaryText}>{i18n.t('ui:btnSave')}</Text>
              </Pressable>
            </Card>
          )}
        </FormValidation>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const localStyles = StyleSheet.create({
  button: {
    ...primary,
    marginTop: 16,
  },
  infoBanner: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: `${info}14`, // ~8% opacity, misma idea que rgba(8,127,140,0.08) del diseño
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  infoIcon: {
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    color: infoText,
  },
  writtenSignatureInput: {
    fontSize: 20,
    fontStyle: "italic",
  },
});

export default TabInstallationSignatureProof;