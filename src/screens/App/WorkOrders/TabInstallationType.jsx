import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, ScrollView, Text, ToastAndroid, Pressable } from 'react-native';
import i18n from '@i18n/i18n';
import FormValidation from '@components/molecules/FormValidation';
import FormCompletionTracker from '@components/atoms/FormCompletionTracker';
import { useWorkOrderFormCompletion } from '@context/WorkOrderFormCompletionContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card from '@components/molecules/Card';
import { spacing, buttonStyles, palette } from '@themes';
import { installation as styles, common as commonStyles } from './styles';
import SegmentedToggle from "@components/atoms/SegmentedToggle";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import WorkOrderRepository from '@repositories/WorkOrderRepository';

const { primary, primaryText } = buttonStyles;
const { white } = palette;

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

const startingInitials = {
  vehicle: '',
  installationType: '',
  powerOffType: '',
  batteryType: '',
};

const TabInstallationType = ({ route }) => {
  const [formInitialValues, setFormInitialValues] = useState(null);
  const [isLoadingWorkOrder, setIsLoadingWorkOrder] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSendData, setIsLoadingSendData] = useState(false);

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
  const onFormCompleted = useWorkOrderFormCompletion();
  const workOrderRepository = WorkOrderRepository();

  // Offline-first: se lee siempre de SQLite local, nunca de la API directamente.
  // work_orders se puebla (id_tarea, numero_orden, progreso_orden_trabajo) apenas se
  // traen las unidades del ticket (useFetchUnitWorkOrders -> seedFromUnits), y
  // 'instalacion' se actualiza local de inmediato al guardar este formulario (ver
  // handleSave/saveInstallation) — no hace falta ninguna llamada de red para mostrar
  // el estado actual, con o sin conexión.
  async function getWorkOrder() {
    try {
      const currentWorkOrder = await workOrderRepository.getLocalById(id_orden_trabajo);

      if (currentWorkOrder?.instalacion) {
        const [vehicle, installationType, powerOffType, batteryType] = currentWorkOrder.instalacion.split('|');

        setSelectedOption((prev) => ({
            ...prev,
            id_tarea: tareaId,
            id_orden_trabajo: id_orden_trabajo,
            vehicle,
            installationType,
            powerOffType,
            batteryType,
        }));

        setFormInitialValues({
          vehicle,
          installationType,
          powerOffType,
          batteryType,
        });
      } else {
        setSelectedOption((prev) => ({...prev, ...startingInitials}));
        setFormInitialValues(startingInitials);
      }

    setIsLoadingWorkOrder(false);
    } catch (error) {
      console.error("Error al obtener el work order", error);
      setFormInitialValues(startingInitials);
    } finally {
        setIsLoadingWorkOrder(false);
    }
  }

  useEffect(() => {
      getWorkOrder();
  }, []);

  const validationInput = [
    { key: "vehicle", type: "string", message: i18n.t("workOrder:vehicleMessageValidation") },
    { key: "installationType", type: "string", message: i18n.t("workOrder:installationMessageValidation") },
    { key: "powerOffType", type: "string", message: i18n.t("workOrder:powerOffMessageValidation") },
    { key: "batteryType", type: "string", message: i18n.t("workOrder:batteryMessageValidation") }
  ];

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
    // Verificar si todos los campos obligatorios han sido seleccionados
    if (
      !selectedOption.vehicle || 
      !selectedOption.installationType || 
      !selectedOption.powerOffType || 
      !selectedOption.batteryType
    ) {
      return; // Evita que se envíen los datos al servidor si faltan campos obligatorios
    }

    setIsLoadingSendData(true);

    try {
      // Offline-first: escribe 'instalacion' en SQLite local de inmediato y encola el
      // envío a POST /api/work-orders (SyncManager lo manda en cuanto hay conexión, ver
      // WorkOrderRepository.saveInstallation). El formulario ya no depende de que el
      // request al servidor termine — ni siquiera de que haya conexión — para considerar
      // el guardado exitoso, igual que el resto del flujo offline-first de la app.
      await workOrderRepository.saveInstallation(tareaId, id_orden_trabajo, {
        vehicle: selectedOption.vehicle,
        installationType: selectedOption.installationType,
        powerOffType: selectedOption.powerOffType,
        batteryType: selectedOption.batteryType,
      });

      ToastAndroid.show('Instalación guardada correctamente.', ToastAndroid.LONG);

      if (userData?.employee?.id_usuario_empleado) {
        await FormCompletionTracker.markFormAsCompleted(
          "form_installation_type",
          clienteId,
          tareaId,
          id_orden_trabajo,
          userData.employee.id_usuario_empleado,
          () => workOrderRepository.startWorkOrder(tareaId, id_orden_trabajo, {
            userId: userData.employee.id_usuario_empleado,
            clienteId,
          })
        );
        onFormCompleted?.();
      } else {
        console.warn("No se pudo marcar el formulario como completado: userData aún no está disponible.");
      }
    } catch (error) {
      console.error('Error al guardar la instalación:', error.message);
      ToastAndroid.show('No se pudo guardar la instalación.', ToastAndroid.LONG);
    } finally {
      setIsLoadingSendData(false);
    }
  };

  return (
    <View style={commonStyles.container}>
      <FormValidation
        initialValues={formInitialValues}
        isLoading={isLoadingWorkOrder}
        validationInput={validationInput}
        onSubmit={handleSave}
      >
        {({ handleChange, handleBlur, handleSubmit, values, touched, errors }) => (
          <>
            <ScrollView contentContainerStyle={commonStyles.scrollViewContent}>
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
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Pressable style={primary} onPress={handleSubmit} disabled={isLoadingSendData}>
                {isLoadingSendData ? (
                  <ActivityIndicator size="small" color={white} />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} size={16} color={white} />
                    <Text style={primaryText}>{i18n.t('ui:btnSave')}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </>
        )}
      </FormValidation>
    </View>
  );
};

export default TabInstallationType;
