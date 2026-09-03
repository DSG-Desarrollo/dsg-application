import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Text,
  Pressable,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { faSave, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import DrawableImage from "@components/molecules/DrawableImage";
import Card from "@components/molecules/Card";
import FormValidation from "@components/molecules/FormValidation";
import SegmentedToggle from "@components/atoms/SegmentedToggle";
import { signature as styles } from "./styles";
import { buttonStyles } from '@themes';
import theme from '@themes/theme';
import i18n from '@i18n/i18n';

const { primary, primaryText } = buttonStyles;
const { info, infoText, textPrimary } = theme.colors;

const { width: screenWidth } = Dimensions.get("window");
const canvasSize = screenWidth * 0.86; // ligeramente menor para dejar margen del Card

/**
 * Captura la firma (dibujada o escrita) del cliente y delega su envío al padre vía
 * `onSubmit`. No conoce ni la tarea ni ninguna orden de trabajo en particular: la firma
 * se captura una única vez por ticket y es el padre (TicketDetailScreen) quien decide a
 * qué OT(s) aplica y qué hacer con la respuesta (guardar, finalizar OT/ticket, etc.).
 */
const TabInstallationSignatureProof = ({ onSubmit, isSubmitting = false }) => {
  const [showDrawableImage, setShowDrawableImage] = useState(false);
  const [clearPaths, setClearPaths] = useState(false);
  const [signatureMode, setSignatureMode] = useState("dibujada");
  const drawableImageRef = useRef(null);

  const SIGNATURE_MODE_OPTIONS = [
    { value: "dibujada", label: i18n.t('workOrder:signatureModeDrawn') },
    { value: "escrita", label: i18n.t('workOrder:signatureModeWritten') },
  ];

  useEffect(() => {
    setShowDrawableImage(true);
  }, []);

  const initialValues = { nombre_firma_cliente: "" };
  const validationInput = [
    {
      key: "nombre_firma_cliente",
      type: "string",
      min: 3,
      message: i18n.t('workOrder:signatureNameValidation'),
    },
  ];

  const handlePathsCleared = () => setClearPaths(false);

  const handleSave = async (values) => {
    const isDrawMode = signatureMode === "dibujada";

    if (isDrawMode && !drawableImageRef.current) {
      return;
    }

    await onSubmit({
      nombre_firma_cliente: values.nombre_firma_cliente,
      tipo_firma: signatureMode,
      image: isDrawMode ? await drawableImageRef.current.captureCanvas() : null,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <FormValidation
        initialValues={initialValues}
        validationInput={validationInput}
        onSubmit={handleSave}
      >
        {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
          <>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Card title={i18n.t('workOrder:titleSignature')} style={styles.formCard}>
              <View style={localStyles.infoBanner}>
                <FontAwesomeIcon icon={faInfoCircle} size={15} color={info} style={localStyles.infoIcon} />
                <Text style={localStyles.infoText}>
                  {i18n.t('workOrder:informationSignature')}
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
                  <Text style={styles.fieldLabel}>{i18n.t('workOrder:signatureWrittenLabel')}</Text>
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
                    placeholder={i18n.t('workOrder:placeholderSignature')}
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
            </Card>
          </ScrollView>

          <View style={styles.saveContainer}>
            <Pressable
              style={[primary, isSubmitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={textPrimary} />
              ) : (
                <FontAwesomeIcon icon={faSave} size={16} color={textPrimary} />
              )}
              <Text style={primaryText}>{i18n.t(isSubmitting ? 'ui:btnSaving' : 'ui:btnSave')}</Text>
            </Pressable>
          </View>
          </>
        )}
      </FormValidation>
    </KeyboardAvoidingView>
  );
};

const localStyles = StyleSheet.create({
  infoBanner: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: `${info}14`,
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
