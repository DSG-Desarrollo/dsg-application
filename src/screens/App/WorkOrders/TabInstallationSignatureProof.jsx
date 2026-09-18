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
import { createSignatureStyles } from "./styles";
import { buttonStyles } from '@themes';
import theme from '@themes/theme';
import { useTheme } from '@context/ThemeContext';
import i18n from '@i18n/i18n';

const { primary, primaryText } = buttonStyles;
const { info, textPrimary } = theme.colors;

const { width: screenWidth } = Dimensions.get("window");
const canvasSize = screenWidth * 0.86; // ligeramente menor para dejar margen del Card

/**
 * Captura la firma (dibujada o escrita) del cliente y delega su envío al padre vía
 * `onSubmit`. No conoce ni la tarea ni ninguna orden de trabajo en particular: la firma
 * se captura una única vez por ticket y es el padre (TicketDetailScreen) quien decide a
 * qué OT(s) aplica y qué hacer con la respuesta (guardar, finalizar OT/ticket, etc.).
 */
const TabInstallationSignatureProof = ({ onSubmit, isSubmitting = false }) => {
  const { colors } = useTheme();
  const styles = createSignatureStyles(colors);
  const localStyles = createLocalStyles(colors);
  const [showDrawableImage, setShowDrawableImage] = useState(false);
  const [clearPaths, setClearPaths] = useState(false);
  const [signatureMode, setSignatureMode] = useState("dibujada");
  const [drawingTooSmall, setDrawingTooSmall] = useState(false);
  const drawableImageRef = useRef(null);

  // Cambiar de modo no debe arrastrar un error que ya no aplica (p.ej. quedó marcado
  // "trazo muy chico" en modo dibujada y el técnico se pasa a "escrita").
  const handleSignatureModeChange = (mode) => {
    setDrawingTooSmall(false);
    setSignatureMode(mode);
  };

  const SIGNATURE_MODE_OPTIONS = [
    { value: "dibujada", label: i18n.t('workOrder:signatureModeDrawn') },
    { value: "escrita", label: i18n.t('workOrder:signatureModeWritten') },
  ];

  useEffect(() => {
    setShowDrawableImage(true);
  }, []);

  const initialValues = { nombre_firma_cliente: "" };
  // La firma ahora es opcional: dejar el campo en blanco es válido (equivale a "no
  // firmó"). `optional: true` mantiene la regla de "al menos 3 caracteres" activa,
  // pero solo se dispara si el técnico llegó a escribir algo (ver FormValidation).
  const validationInput = signatureMode === "escrita"
    ? [
        {
          key: "nombre_firma_cliente",
          type: "string",
          min: 3,
          minMessage: i18n.t('workOrder:signatureNameValidation'),
          optional: true,
        },
      ]
    : [];

  const handlePathsCleared = () => {
    setClearPaths(false);
    setDrawingTooSmall(false);
  };

  const handleSave = async (values) => {
    const isDrawMode = signatureMode === "dibujada";

    if (isDrawMode) {
      if (!drawableImageRef.current) {
        return;
      }

      // Mismo criterio que el nombre escrito: un lienzo intacto se guarda igual (sin
      // firma, es opcional), pero si el técnico ya empezó a dibujar, un trazo
      // insignificante (p.ej. un toque accidental) no es una firma completa y bloquea
      // el guardado hasta que la complete o la borre con el botón de goma.
      if (drawableImageRef.current.hasDrawn && !drawableImageRef.current.hasMeaningfulDrawing()) {
        setDrawingTooSmall(true);
        return;
      }
      setDrawingTooSmall(false);
    }

    // Lienzo intacto (hasDrawn=false): no hay nada que capturar. Antes se llamaba
    // igual a captureCanvas(), que devuelve un PNG válido pero en blanco -- el backend
    // lo guarda como image_path no vacío y el PDF termina mostrando el recuadro de
    // imagen vacío en vez de caer al fallback de texto con el nombre del cliente.
    const hasImageToSend = isDrawMode && drawableImageRef.current.hasDrawn;

    await onSubmit({
      nombre_firma_cliente: values.nombre_firma_cliente,
      tipo_firma: signatureMode,
      image: hasImageToSend ? await drawableImageRef.current.captureCanvas() : null,
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
                onChange={handleSignatureModeChange}
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
                  {drawingTooSmall && (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{i18n.t('workOrder:signatureDrawingTooSmall')}</Text>
                    </View>
                  )}
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
                    placeholderTextColor={colors.textSecondary}
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

const createLocalStyles = (colors) => StyleSheet.create({
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
    color: colors.textSecondary,
  },
  writtenSignatureInput: {
    fontSize: 20,
    fontStyle: "italic",
  },
});

export default TabInstallationSignatureProof;
