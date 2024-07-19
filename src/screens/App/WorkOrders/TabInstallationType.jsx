import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, ToastAndroid, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { RadioButton } from 'react-native-paper';
import i18n from '../../../../i18n';
import TicketService from '../../../services/api/tickets/TicketService';
import FormValidation from '../../../components/molecules/FormValidation';
import FormCompletionTracker from '../../../components/atoms/FormCompletionTracker';
import useUserData from '../../../hooks/useUserData';

const TabInstallationType = ({ route }) => {
  const { userData, loading, error } = useUserData();

  const {
    tareaId,
    clienteId,
    id_orden_trabajo,
    id_servicio_cliente,
    id_unidad,
  } = route.params;
  const validationInput = [
    { key: "vehicle", type: "string", message: "El tipo de vehículo es requerido" },
    { key: "installationType", type: "string", message: "El tipo de instalación es requerido" },
    { key: "powerOffType", type: "string", message: "El tipo de apagado es requerido" },
    { key: "batteryType", type: "string", message: "El tipo de batería es requerido" }
  ];
  const startingInitials = {
    vehicle: '',
    installationType: '',
    powerOffType: '',
    batteryType: '',
  };
  const ticketService = new TicketService();
  const [selectedOption, setSelectedOption] = useState({
    id_tarea: tareaId,
    id_orden_trabajo: id_orden_trabajo,
    vehicle: null,
    installationType: null,
    powerOffType: null,
    batteryType: null,
  });

  // Función para manejar el cambio de opción seleccionada
  const handleOptionChange = (key, value, handleChange, handleBlur) => {
    setSelectedOption({ ...selectedOption, [key]: value });
    // Actualiza el valor en values
    handleChange(key)(value);
    // Indica que el campo ha sido tocado
    handleBlur(key);
  };

  const handleSave = async () => {
    try {
      // Verificar si todos los campos obligatorios han sido seleccionados
      if (!selectedOption.vehicle || !selectedOption.installationType || !selectedOption.powerOffType || !selectedOption.batteryType) {
        // Podrías mostrar un mensaje de error en la interfaz para indicar al usuario que debe seleccionar una opción en cada campo
        return; // Evita que se envíen los datos al servidor si faltan campos obligatorios
      } else {
        // Enviar los datos utilizando el método sendFormData de TicketService
        const response = await ticketService.sendFormData(selectedOption, 'api/work-orders');
        //console.log('Respuesta del servidor:', response);

        // Verificar si la respuesta indica que la solicitud fue exitosa (código de estado HTTP 201)
        if (response.status === 201 || response.status === 200) {
          // La solicitud fue exitosa, puedes manejar la respuesta como desees
          //console.log('Datos del registro insertado:', response.data);
          //console.log('Último ID insertado:', response.last_insert_id);
          ToastAndroid.show(response.message, ToastAndroid.LONG);

          await FormCompletionTracker.markFormAsCompleted("form_installation_type", clienteId, tareaId, id_orden_trabajo, userData.id_usuario);

          // Aquí puedes realizar acciones adicionales, como actualizar la interfaz de usuario
        } else {
          // La solicitud no fue exitosa, manejar el caso de manera adecuada
          console.error('La solicitud no fue exitosa:', response.statusText);
        }
      }
      // Aquí podrías manejar la respuesta del servidor como desees
    } catch (error) {
      console.error('Error al enviar los datos_:', error.message);
      // Aquí podrías manejar el error como desees
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <FormValidation
          initialValues={startingInitials}
          validationInput={validationInput}
          onSubmit={handleSave}
        >
          {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
            <View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{i18n.t('vehicleType')}</Text>
                <View style={styles.radioGroupHorizontal}>
                  <Pressable onPress={() => handleOptionChange('vehicle', 'VH', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="VH"
                      status={selectedOption.vehicle === 'VH' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('vehicle', 'VH', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('vehicleVH')}</Text>
                  </Pressable>

                  <Pressable onPress={() => handleOptionChange('vehicle', 'FG', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="FG"
                      status={selectedOption.vehicle === 'FG' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('vehicle', 'FG', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('vehicleFG')}</Text>
                  </Pressable>
                </View>
                {touched.vehicle && errors.vehicle && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errors.vehicle}</Text>
                  </View>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>{i18n.t('installationType')}</Text>
                <View style={styles.radioGroupHorizontal}>
                  <Pressable onPress={() => handleOptionChange('installationType', 'T1', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="T1"
                      status={selectedOption.installationType === 'T1' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('installationType', 'T1', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('installationT1')}</Text>
                  </Pressable>

                  <Pressable onPress={() => handleOptionChange('installationType', 'T2', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="T2"
                      status={selectedOption.installationType === 'T2' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('installationType', 'T2', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('installationT2')}</Text>
                  </Pressable>
                </View>
                {touched.installationType && errors.installationType && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errors.installationType}</Text>
                  </View>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>{i18n.t('powerOffType')}</Text>
                <View style={styles.radioGroupHorizontal}>
                  <Pressable onPress={() => handleOptionChange('powerOffType', 'AR', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="AR"
                      status={selectedOption.powerOffType === 'AR' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('powerOffType', 'AR', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('powerOffAR')}</Text>
                  </Pressable>

                  <Pressable onPress={() => handleOptionChange('powerOffType', 'SAR', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="SAR"
                      status={selectedOption.powerOffType === 'SAR' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('powerOffType', 'SAR', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('powerOffSAR')}</Text>
                  </Pressable>
                </View>
                {touched.powerOffType && errors.powerOffType && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errors.powerOffType}</Text>
                  </View>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>{i18n.t('batteryType')}</Text>
                <View style={styles.radioGroupHorizontal}>
                  <Pressable onPress={() => handleOptionChange('batteryType', 'BI', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="BI"
                      status={selectedOption.batteryType === 'BI' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('batteryType', 'BI', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('batteryBI')}</Text>
                  </Pressable>

                  <Pressable onPress={() => handleOptionChange('batteryType', 'SBI', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="SBI"
                      status={selectedOption.batteryType === 'SBI' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('batteryType', 'SBI', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('batterySBI')}</Text>
                  </Pressable>
                </View>
                {touched.batteryType && errors.batteryType && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errors.batteryType}</Text>
                  </View>
                )}
              </View>

              <Pressable style={styles.saveButton} onPress={handleSubmit}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </Pressable>
            </View>
          )}
        </FormValidation>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center', // Alinear verticalmente los elementos en el grupo
  },
  radioGroupHorizontal: {
    flexDirection: 'row', // Cambiar la dirección del diseño a horizontal
    alignItems: 'center', // Alinear los elementos verticalmente en el centro
    justifyContent: 'space-between', // Espacio uniforme entre los elementos
    marginTop: 10, // Espacio superior opcional
  },
  radioContainer: {
    flexDirection: 'row', // Alinear los radios y el texto horizontalmente
    alignItems: 'center', // Alinear los elementos verticalmente en el centro
  },
  radioLabel: {
    fontSize: 16,
    marginLeft: 8, // Espacio entre el radio button y el texto
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorContainer: {
    marginTop: 5,
    backgroundColor: '#ffcccc',
    padding: 5,
    borderRadius: 5,
  },
  errorMessage: {
    color: '#ff0000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TabInstallationType;
