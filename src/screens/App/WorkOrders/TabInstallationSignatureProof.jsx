import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, ToastAndroid } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import FormCompletionTracker from '../../../components/atoms/FormCompletionTracker';
import { faSave, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import DrawableImage from '../../../components/molecules/DrawableImage';
import ActionButtons from '../../../components/atoms/ActionButtons';
import ApiService from '../../../services/api/ApiService';
import useUserData from '../../../hooks/useUserData';

const TabInstallationSignatureProof = ({ route }) => {
  const {
    tareaId,
    codigo,
    estado,
    empresa,
    prioridad,
    fechaCreacion,
    tipo,
    trabajo,
    servicio,
    direccionTarea,
    requeridos,
    id_orden_trabajo,
    id_servicio_cliente,
    id_unidad,
  } = route.params;
  const { userData } = useUserData();
  const [allFormsCompleted, setAllFormsCompleted] = useState(false);
  const [anyFormCompleted, setAnyFormCompleted] = useState(false);
  const [showDrawableImage, setShowDrawableImage] = useState(false);
  const drawableImageRef = useRef(null);
  const [text, onChangeText] = React.useState('');

  const handleSave = async () => {

    try {
      if (drawableImageRef.current) {
        const base64Image = await drawableImageRef.current.captureCanvas();

        const apiService = new ApiService();
        const formData = {
          id_tarea: tareaId,
          id_orden_trabajo: id_orden_trabajo,
          nombre_firma_cliente: text,
          image: base64Image,
        };

        // Endpoint al que se enviarán los datos
        const endpoint = 'api/client-signature';

        // Enviar los datos utilizando el método sendFormData de ApiService
        const response = await apiService.sendFormData(formData, endpoint);
        console.log('Respuesta de la API:', response);
        ToastAndroid.showWithGravity(
          response.message || 'Registro actualizado exitosamente',
          ToastAndroid.LONG,
          ToastAndroid.BOTTOM
        );

        await FormCompletionTracker.markFormAsCompleted("form_installation_signature_proof", tareaId, id_orden_trabajo, userData.id_usuario);

      } else {
        console.log("Null");
      }
    } catch (error) {
      console.log('Error al capturar la imagen del lienzo:', error);
      ToastAndroid.showWithGravity(
        error.message || 'Hubo un problema al actualizar el registro',
        ToastAndroid.LONG,
        ToastAndroid.BOTTOM
      );
    }
  };

  useEffect(() => {
    setShowDrawableImage(true);
  }, []);

  const handleEdit = () => {
    console.log('Editar acción ejecutada');
  };

  const buttons = [
    { text: 'Guardar', icon: faSave, onPress: handleSave },
    { text: 'Editar', icon: faEdit, onPress: handleEdit },
  ];

  return (
    <View style={styles.container}>
      {showDrawableImage && (
        <DrawableImage
          ref={drawableImageRef}
          blankCanvas={true}
          strokeColor="black"
          strokeWidth={4}
          containerStyle={styles.fixedImageContainer}
          imageStyle={styles.fixedImage}
        />
      )}
      <TextInput
        style={[styles.input, styles.underline]}
        onChangeText={onChangeText}
        value={text}
        placeholder="Ingrese su texto aquí"
        placeholderTextColor="#888" // Color del texto de marcador
        underlineColorAndroid="transparent" // Ocultar la línea predeterminada en Android
      />
      <View style={styles.container}>
        <ActionButtons
          buttons={buttons}
          buttonContainerStyle={styles.customButtonContainer}
          buttonStyle={styles.customButton}
          buttonTextStyle={styles.customButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 5, // Margen alrededor del contenedor para separarlo de los bordes de la pantalla
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: '#333', // Color del texto del input
  },
  underline: {
    borderBottomWidth: 1, // Añadir una línea inferior
    borderBottomColor: '#888', // Color de la línea inferior
  },
  fixedImageContainer: {
    width: '100%',
    height: '100%',
    margin: 10,
  },
  fixedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  customButton: {
    backgroundColor: '#ff6347', // Cambiar color de fondo del botón
    borderRadius: 20, // Aumentar el radio de borde del botón
    marginVertical: 5, // Añadir margen vertical entre botones
  },
  customButtonText: {
    color: '#fff', // Cambiar color del texto del botón
    fontSize: 18, // Aumentar tamaño del texto del botón
  },
  customButtonContainer: {
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Cambiado a 'flex-start' para alinear a la izquierda
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20, // Ajuste adicional para margen izquierdo
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
  },
  buttonText: {
    marginLeft: 10,
    color: '#007bff',
    fontSize: 16,
  },
});

export default TabInstallationSignatureProof;
