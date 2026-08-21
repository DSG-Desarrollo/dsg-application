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
} from "react-native";
import { faSave, faEraser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import DrawableImage from "@components/molecules/DrawableImage";
import Card from "@components/molecules/Card";
import ApiService from "@services/api/ApiService";
import FormValidation from "@components/molecules/FormValidation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signature as styles } from "./styles";

const { width: screenWidth } = Dimensions.get("window");
const canvasSize = screenWidth * 0.86; // ligeramente menor para dejar margen del Card

const TabInstallationSignatureProof = ({ route }) => {
  const [userData, setUserData] = useState(null);
  const { tareaId, id_orden_trabajo, clienteId } = route.params;
  const [showDrawableImage, setShowDrawableImage] = useState(false);
  const [clearPaths, setClearPaths] = useState(false);
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

  const handleClearSignature = () => setClearPaths(true);
  const handlePathsCleared = () => setClearPaths(false);

  const handleSave = async (values) => {
    try {
      if (drawableImageRef.current) {
        const base64Image = await drawableImageRef.current.captureCanvas();
        const apiService = new ApiService();
        const formData = {
          id_tarea: tareaId,
          id_orden_trabajo: id_orden_trabajo,
          nombre_firma_cliente: values.nombre_firma_cliente,
          image: base64Image,
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
              <Text style={styles.instructionText}>
                Pide al cliente que firme dentro del recuadro
              </Text>

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

              <Pressable style={styles.clearButton} onPress={handleClearSignature}>
                <FontAwesomeIcon icon={faEraser} size={14} color="#555" />
                <Text style={styles.clearButtonText}>Borrar firma</Text>
              </Pressable>

              <View style={styles.divider} />

              <Text style={styles.fieldLabel}>Nombre de quien firma</Text>
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
                placeholder="Ej. Ana Martínez"
                placeholderTextColor="#aaa"
                underlineColorAndroid="transparent"
              />

              {touched.nombre_firma_cliente && errors.nombre_firma_cliente && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errors.nombre_firma_cliente}</Text>
                </View>
              )}

              <Pressable style={styles.saveButton} onPress={handleSubmit}>
                <FontAwesomeIcon icon={faSave} size={16} color="#ffffff" />
                <Text style={styles.saveButtonText}>Guardar</Text>
              </Pressable>
            </Card>
          )}
        </FormValidation>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default TabInstallationSignatureProof;