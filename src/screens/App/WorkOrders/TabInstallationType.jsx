import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Text, ToastAndroid, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { RadioButton } from 'react-native-paper';
import i18n from '@i18n/i18n';
import TicketService from '@services/api/tickets/TicketService';
import FormValidation from '@components/molecules/FormValidation';
import FormCompletionTracker from '@components/atoms/FormCompletionTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '@components/molecules/Card';
import { spacing } from '@themes';
import { installation as styles } from './styles';

const TabInstallationType = ({ route }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userData');
        setUserData(jsonValue ? JSON.parse(jsonValue) : null);
      } catch (e) {
        console.error("Error reading userData from storage", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
        return; // Evita que se envíen los datos al servidor si faltan campos obligatorios
      } else {
        // Enviar los datos utilizando el método sendFormData de TicketService
        const response = await ticketService.sendFormData(selectedOption, 'api/work-orders');
        console.log('Respuesta del servidor:', response);

        // Verificar si la respuesta indica que la solicitud fue exitosa (código de estado HTTP 201)
        if (response.status === 201 || response.status === 200) {
          // La solicitud fue exitosa
          console.log('Datos del registro insertado:', response.data);
          console.log('Último ID insertado:', response.last_insert_id);
          ToastAndroid.show(response.message, ToastAndroid.LONG);
          
          await FormCompletionTracker.markFormAsCompleted("form_installation_type", clienteId, tareaId, id_orden_trabajo, userData.employee.id_usuario_empleado);
        } else {
          // La solicitud no fue exitosa, manejar el caso de manera adecuada
          console.error('La solicitud no fue exitosa:', response.statusText);
        }
      }
    } catch (error) {
      console.error('Error al enviar los datos_:', error.message);
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
            <View style={styles.container}>
              <Card
                title={i18n.t('workOrder:vehicleType')}
                style={{ marginBottom: spacing.md }}
              >
                <View style={styles.radioGroupHorizontal}>
                  <Pressable onPress={() => handleOptionChange('vehicle', 'VH', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="VH"
                      status={selectedOption.vehicle === 'VH' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('vehicle', 'VH', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('workOrder:vehicleVH')}</Text>
                  </Pressable>

                  <Pressable onPress={() => handleOptionChange('vehicle', 'FG', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="FG"
                      status={selectedOption.vehicle === 'FG' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('vehicle', 'FG', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('workOrder:vehicleFG')}</Text>
                  </Pressable>
                </View>
                {touched.vehicle && errors.vehicle && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errors.vehicle}</Text>
                  </View>
                )}
              </Card>

              <Card
                title={i18n.t('workOrder:installationType')}
                style={{ marginBottom: spacing.md }}
              >
                <View style={styles.radioGroupHorizontal}>
                  <Pressable onPress={() => handleOptionChange('installationType', 'T1', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="T1"
                      status={selectedOption.installationType === 'T1' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('installationType', 'T1', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('workOrder:installationT1')}</Text>
                  </Pressable>

                  <Pressable onPress={() => handleOptionChange('installationType', 'T2', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="T2"
                      status={selectedOption.installationType === 'T2' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('installationType', 'T2', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('workOrder:installationT2')}</Text>
                  </Pressable>
                </View>
                {touched.installationType && errors.installationType && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errors.installationType}</Text>
                  </View>
                )}
              </Card>

              <Card
                title={i18n.t('workOrder:powerOffType')}
                style={{ marginBottom: spacing.md }}
              >
                <View style={styles.radioGroupHorizontal}>
                  <Pressable onPress={() => handleOptionChange('powerOffType', 'AR', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="AR"
                      status={selectedOption.powerOffType === 'AR' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('powerOffType', 'AR', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('workOrder:powerOffAR')}</Text>
                  </Pressable>

                  <Pressable onPress={() => handleOptionChange('powerOffType', 'SAR', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="SAR"
                      status={selectedOption.powerOffType === 'SAR' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('powerOffType', 'SAR', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('workOrder:powerOffSAR')}</Text>
                  </Pressable>
                </View>
                {touched.powerOffType && errors.powerOffType && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errors.powerOffType}</Text>
                  </View>
                )}
              </Card>

              <Card
                title={i18n.t('workOrder:batteryType')}
                style={{ marginBottom: spacing.md }}
              >
                <View style={styles.radioGroupHorizontal}>
                  <Pressable onPress={() => handleOptionChange('batteryType', 'BI', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="BI"
                      status={selectedOption.batteryType === 'BI' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('batteryType', 'BI', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('workOrder:batteryBI')}</Text>
                  </Pressable>

                  <Pressable onPress={() => handleOptionChange('batteryType', 'SBI', handleChange, handleBlur)} style={styles.radioContainer}>
                    <RadioButton
                      value="SBI"
                      status={selectedOption.batteryType === 'SBI' ? 'checked' : 'unchecked'}
                      onPress={() => handleOptionChange('batteryType', 'SBI', handleChange, handleBlur)}
                    />
                    <Text style={styles.radioLabel}>{i18n.t('workOrder:batterySBI')}</Text>
                  </Pressable>
                </View>
                {touched.batteryType && errors.batteryType && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{errors.batteryType}</Text>
                  </View>
                )}
              </Card>

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

export default TabInstallationType;
