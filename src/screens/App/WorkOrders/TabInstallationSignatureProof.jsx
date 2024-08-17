import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ToastAndroid,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Text,
  Dimensions,
} from "react-native";
import { faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import FormCompletionTracker from "../../../components/atoms/FormCompletionTracker";
import DrawableImage from "../../../components/molecules/DrawableImage";
import ActionButtons from "../../../components/atoms/ActionButtons";
import ApiService from "../../../services/api/ApiService";
import FormValidation from "../../../components/molecules/FormValidation";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Define el tamaño del canvas (por ejemplo, 80% del tamaño de la pantalla)
const canvasSize = screenWidth * 0.9;

const TabInstallationSignatureProof = ({ route }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("userData");
        setUserData(jsonValue ? JSON.parse(jsonValue) : null);
      } catch (e) {
        console.error("Error reading userData from storage", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  const { tareaId, id_orden_trabajo, clienteId } = route.params;
  const [showDrawableImage, setShowDrawableImage] = useState(false);
  const drawableImageRef = useRef(null);

  const initialValues = { nombre_firma_cliente: "" }; // Valores iniciales
  const validationInput = [
    {
      key: "nombre_firma_cliente",
      type: "string",
      min: 3,
      message: "El nombre es obligatorio y debe tener al menos 3 caracteres",
    },
  ];

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

        const endpoint = "api/client-signature";
        const response = await apiService.sendFormData(formData, endpoint);

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
            userData.employee.id_empleado
          );
        } else {
          // Manejar posibles respuestas con errores
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

  useEffect(() => {
    setShowDrawableImage(true);
  }, []);

  const handleEdit = () => {
    console.log("Editar acción ejecutada");
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
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            touched,
            errors,
          }) => (
            <View style={styles.formContainer}>
              <View style={styles.imageContainer}>
                {showDrawableImage && (
                  <DrawableImage
                    ref={drawableImageRef}
                    blankCanvas={true}
                    strokeColor="black"
                    strokeWidth={4}
                    containerStyle={[
                      styles.canvasContainer,
                      { width: canvasSize, height: canvasSize },
                    ]}
                    imageStyle={styles.fixedImage}
                  />
                )}
              </View>

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
                placeholder="Ingrese su nombre aquí"
                placeholderTextColor="#888"
                underlineColorAndroid="transparent"
              />

              {touched.nombre_firma_cliente && errors.nombre_firma_cliente && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {errors.nombre_firma_cliente}
                  </Text>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <ActionButtons
                  buttons={[
                    { text: "Guardar", icon: faSave, onPress: handleSubmit },
                    { text: "Editar", icon: faEdit, onPress: handleEdit },
                  ]}
                  buttonContainerStyle={styles.customButtonContainer}
                  buttonStyle={styles.customButton}
                  buttonTextStyle={styles.customButtonText}
                />
              </View>
            </View>
          )}
        </FormValidation>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  canvasContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  fixedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  input: {
    height: 50,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: "#333",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: "#888",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "#C0392B",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 20,
  },
  customButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  customButton: {
    backgroundColor: "#ff6347",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 5,
  },
  errorContainer: {
    marginTop: 5,
    backgroundColor: "#F8D7DA",
    padding: 5,
    borderRadius: 5,
  },
  customButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
  },
});

export default TabInstallationSignatureProof;
