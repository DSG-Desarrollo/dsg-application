import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ToastAndroid, Pressable } from 'react-native';
import i18n from '@i18n/i18n';
import TicketService from '@services/api/tickets/TicketService';
import FormValidation from '@components/molecules/FormValidation';
import FormCompletionTracker from '@components/atoms/FormCompletionTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '@components/molecules/Card';
import { spacing, buttonStyles } from '@themes';
import { installation as styles, common as commonStyles } from './styles';
import SegmentedToggle from "@components/atoms/SegmentedToggle";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

const { primary, primaryText } = buttonStyles;

const FIELD_GROUPS = [
  {
    key: "vehicle",
    titleKey: "workOrder:vehicleType",
    options: [
      { value: "VH", labelKey: "workOrder:vehicleVH" },
      { value: "FG", labelKey: "workOrder:vehicleFG" },
    ],
  },
  {
    key: "installationType",
    titleKey: "workOrder:installationType",
    options: [
      { value: "T1", labelKey: "workOrder:installationT1" },
      { value: "T2", labelKey: "workOrder:installationT2" },
    ],
  },
  {
    key: "powerOffType",
    titleKey: "workOrder:powerOffType",
    options: [
      { value: "AR", labelKey: "workOrder:powerOffAR" },
      { value: "SAR", labelKey: "workOrder:powerOffSAR" },
    ],
  },
  {
    key: "batteryType",
    titleKey: "workOrder:batteryType",
    options: [
      { value: "BI", labelKey: "workOrder:batteryBI" },
      { value: "SBI", labelKey: "workOrder:batterySBI" },
    ],
  },
];

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
    <View style={commonStyles.container}>
      <ScrollView contentContainerStyle={commonStyles.scrollViewContent}>
        <FormValidation
          initialValues={startingInitials}
          validationInput={validationInput}
          onSubmit={handleSave}
        >
          {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
            <View style={styles.container}>
              {FIELD_GROUPS.map((group) => (
                <Card
                  key={group.key}
                  title={i18n.t(group.titleKey)}
                  style={{ marginBottom: spacing.md }}
                >
                  <SegmentedToggle
                    options={group.options.map((opt) => ({
                      value: opt.value,
                      label: i18n.t(opt.labelKey),
                    }))}
                    value={selectedOption[group.key]}
                    onChange={(value) =>
                      handleOptionChange(group.key, value, handleChange, handleBlur)
                    }
                    error={touched[group.key] && errors[group.key] ? errors[group.key] : null}
                  />
                </Card>
              ))}

              <Pressable style={primary} onPress={handleSubmit}>
                <FontAwesomeIcon icon={faSave} size={16} color="#ffffff" />
                <Text style={primaryText}>{i18n.t('ui:btnSave')}</Text>
              </Pressable>
            </View>
          )}
        </FormValidation>
      </ScrollView>
    </View>
  );
};

export default TabInstallationType;
