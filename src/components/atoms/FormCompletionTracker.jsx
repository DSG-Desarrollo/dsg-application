import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import AxiosManager from '../../utils/AxiosManager';

// Definir las claves de los formularios como constantes
const FORM_KEYS = {
    WORK_ORDER_SUPPLIES: 'form_work_order_supplies',
    INSTALLATION_TYPE: 'form_installation_type',
    EQUIPMENT_LOCATION: 'form_equipment_location',
    INSTALLATION_SIGNATURE_PROOF: 'form_installation_signature_proof',
};

const FORMS = Object.values(FORM_KEYS);
const BASE_URL = Constants.expoConfig.extra.wsERPURL;
const axiosManager = new AxiosManager(BASE_URL);

const FormCompletionTracker = {
    markFormAsCompleted: async (formKey, taskId, workOrderId, userId) => {
        console.log(formKey, taskId, workOrderId, userId);
        try {
            const formData = {
                status: 'completed',
                taskId,
                workOrderId,
            };
            await AsyncStorage.setItem(formKey, JSON.stringify(formData));
            console.log(`Formulario ${formKey} marcado como completado`);

            const allCompleted = await FormCompletionTracker.checkAllFormsCompleted(workOrderId);
            const anyCompleted = await FormCompletionTracker.checkAnyFormCompleted(workOrderId);
            const isFirstCompleted = anyCompleted.formStatuses.filter(status => status.completed).length === 1 && anyCompleted.formStatuses.some(status => status.formKey === formKey && status.completed);

            console.log("Todos completos: ", allCompleted);

            // Iniciar la OT si es el primer formulario completado
            if (isFirstCompleted) {
                await FormCompletionTracker.startWorkOrder(taskId, workOrderId, userId);
            }

            // Finalizar la OT si todos los formularios están completados
            if (allCompleted.allCompleted) {
                await FormCompletionTracker.completeWorkOrder(workOrderId, taskId, userId);
            }
        } catch (error) {
            console.error(`Error marcando el formulario ${formKey} como completado: `, error);
        }
    },

    checkAllFormsCompleted: async (workOrderId) => {
        try {
            const formStatuses = await Promise.all(
                FORMS.map(async (formKey) => {
                    try {
                        const formData = await AsyncStorage.getItem(formKey);
                        if (formData) {
                            const { status, workOrderId: storedWorkOrderId } = JSON.parse(formData);
                            return {
                                formKey,
                                completed: status === 'completed' && storedWorkOrderId === workOrderId
                            };
                        }
                        return { formKey, completed: false };
                    } catch (error) {
                        console.error(`Error al obtener datos del formulario ${formKey}: `, error);
                        return { formKey, completed: false };
                    }
                })
            );

            const allCompleted = formStatuses.every((formStatus) => formStatus.completed);
            return {
                allCompleted,
                formStatuses
            };
        } catch (error) {
            console.error('Error verificando la completitud de los formularios: ', error);
            return { allCompleted: false, formStatuses: [] };
        }
    },

    checkAnyFormCompleted: async (workOrderId) => {
        try {
            const formStatuses = await Promise.all(
                FORMS.map(async (formKey) => {
                    try {
                        const formData = await AsyncStorage.getItem(formKey);
                        if (formData) {
                            const { status, workOrderId: storedWorkOrderId } = JSON.parse(formData);
                            return {
                                formKey,
                                completed: status === 'completed' && storedWorkOrderId === workOrderId
                            };
                        }
                        return { formKey, completed: false };
                    } catch (error) {
                        console.error(`Error al obtener datos del formulario ${formKey}: `, error);
                        return { formKey, completed: false };
                    }
                })
            );

            const anyCompleted = formStatuses.some((formStatus) => formStatus.completed);
            return {
                anyCompleted,
                formStatuses
            };
        } catch (error) {
            console.error('Error verificando la completitud de algún formulario: ', error);
            return { anyCompleted: false, formStatuses: [] };
        }
    },

    startWorkOrder: async (taskId, workOrderId, userId) => {
        try {
            const response = await axiosManager.post(`api/work-orders/${workOrderId}/start`, {
                id_usuario: userId,
                id_tarea: taskId
            });

            console.log(response);



            console.log(`Orden de trabajo ${workOrderId} iniciada`);
        } catch (error) {
            console.error(`Error iniciando la orden de trabajo ${workOrderId}: `, error);
        }
    },

    completeWorkOrder: async (workOrderId, taskId, userId) => {
        try {
            const response = await axiosManager.post(`api/work-orders/${workOrderId}/complete`, {
                fin_orden_trabajo: new Date().toISOString(),
                comentario_orden: 'Trabajo completado exitosamente',
                id_usuario: userId
            });

            console.log(response);

            console.log(`Orden de trabajo ${workOrderId} completada y tarea ${taskId} actualizada`);
        } catch (error) {
            //console.error(`Error completando la orden de trabajo ${workOrderId}: `, error);
        }
    },
};

export default FormCompletionTracker;
