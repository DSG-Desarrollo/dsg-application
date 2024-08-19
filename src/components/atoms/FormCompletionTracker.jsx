import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import AxiosManager from "../../utils/AxiosManager";
import { ToastAndroid } from "react-native";

// Definir las claves de los formularios como constantes
const FORM_KEYS = {
  WORK_ORDER_SUPPLIES: "form_work_order_supplies",
  INSTALLATION_TYPE: "form_installation_type",
  EQUIPMENT_LOCATION: "form_equipment_location",
  INSTALLATION_SIGNATURE_PROOF: "form_installation_signature_proof",
};

const FORMS = Object.values(FORM_KEYS);
const BASE_URL = Constants.expoConfig.extra.wsERPURL;
const axiosManager = new AxiosManager(BASE_URL);

const FormCompletionTracker = {
  markFormAsCompleted: async (
    formKey,
    clientId,
    taskId,
    workOrderId,
    userId
  ) => {
    try {
      const taskIdStr = taskId.toString();
      const workOrderIdStr = workOrderId.toString();

      // Obtener los datos del ticket y orden de trabajo del storage
      let ticketData = JSON.parse(await AsyncStorage.getItem(taskIdStr)) || {};
      let workOrderData = ticketData[workOrderIdStr] || {};

      // Marcar el formulario como completado en la estructura local
      workOrderData[formKey] = { status: "completed", taskId, userId };

      // Actualizar la estructura del ticket y guardarla en el storage
      ticketData[workOrderIdStr] = workOrderData;
      await AsyncStorage.setItem(taskIdStr, JSON.stringify(ticketData));

      console.log(
        `Formulario ${formKey} marcado como completado para la OT ${workOrderId} en el ticket ${clientId}`
      );

      // Verificar cuántos formularios están completados
      const allCompleted = await FormCompletionTracker.checkAllFormsCompleted(
        taskIdStr,
        workOrderIdStr
      );
      const anyCompleted = await FormCompletionTracker.checkAnyFormCompleted(
        taskIdStr,
        workOrderIdStr
      );
      const isFirstCompleted =
        anyCompleted.formStatuses.filter((status) => status.completed)
          .length === 1 &&
        anyCompleted.formStatuses.some(
          (status) => status.formKey === formKey && status.completed
        );

      // Iniciar la OT si es el primer formulario completado
      if (isFirstCompleted) {
        await FormCompletionTracker.startWorkOrder(
          clientId,
          taskIdStr,
          workOrderIdStr,
          userId
        );
        // Mostrar Toast de inicio
        ToastAndroid.show(
          "Proceso iniciado: Primer formulario completado",
          ToastAndroid.SHORT
        );
      }

      // Mostrar Toast con la cantidad de formularios completados y los que faltan
      const completedFormsCount = anyCompleted.formStatuses.filter(
        (status) => status.completed
      ).length;
      const totalFormsCount = FORMS.length;
      const remainingFormsCount = totalFormsCount - completedFormsCount;

      ToastAndroid.show(
        `${completedFormsCount} / ${totalFormsCount} formularios completados. Faltan ${remainingFormsCount} por completar.`,
        ToastAndroid.SHORT
      );

      // Finalizar la OT si todos los formularios están completados
      if (allCompleted.allCompleted) {
        await FormCompletionTracker.completeWorkOrder(
          clientId,
          workOrderIdStr,
          taskIdStr,
          userId
        );
      }
    } catch (error) {
      console.error(
        `Error marcando el formulario ${formKey} como completado: `,
        error
      );
    }
  },

  checkAllFormsCompleted: async (taskId, workOrderId) => {
    try {
      const taskIdStr = taskId.toString();
      const workOrderIdStr = workOrderId.toString();

      const ticketData =
        JSON.parse(await AsyncStorage.getItem(taskIdStr)) || {};
      const workOrderData = ticketData[workOrderIdStr] || {};

      const formStatuses = FORMS.map((formKey) => {
        const formStatus = workOrderData[formKey];
        return {
          formKey,
          completed: formStatus && formStatus.status === "completed",
        };
      });

      const allCompleted = formStatuses.every(
        (formStatus) => formStatus.completed
      );
      return {
        allCompleted,
        formStatuses,
      };
    } catch (error) {
      console.error(
        "Error verificando la completitud de los formularios: ",
        error
      );
      return { allCompleted: false, formStatuses: [] };
    }
  },

  checkAnyFormCompleted: async (taskId, workOrderId) => {
    try {
      const taskIdStr = taskId.toString();
      const workOrderIdStr = workOrderId.toString();

      const ticketData =
        JSON.parse(await AsyncStorage.getItem(taskIdStr)) || {};
      const workOrderData = ticketData[workOrderIdStr] || {};

      const formStatuses = FORMS.map((formKey) => {
        const formStatus = workOrderData[formKey];
        return {
          formKey,
          completed: formStatus && formStatus.status === "completed",
        };
      });

      const anyCompleted = formStatuses.some(
        (formStatus) => formStatus.completed
      );
      return {
        anyCompleted,
        formStatuses,
      };
    } catch (error) {
      console.error(
        "Error verificando la completitud de algún formulario: ",
        error
      );
      return { anyCompleted: false, formStatuses: [] };
    }
  },

  startWorkOrder: async (clientId, taskId, workOrderId, userId) => {
    try {
      const response = await axiosManager.post(
        `api/work-orders/${workOrderId}/start`,
        {
          id_cliente: clientId,
          id_usuario: userId,
          id_tarea: taskId,
        }
      );

      console.log(
        `Orden de trabajo ${workOrderId} iniciada para el ticket ${taskId}`
      );
    } catch (error) {
      console.error(
        `Error iniciando la orden de trabajo ${workOrderId}: `,
        error
      );
    }
  },

  completeWorkOrder: async (clientId, workOrderId, taskId, userId) => {
    try {
      const response = await axiosManager.post(
        `api/work-orders/${workOrderId}/complete`,
        {
          id_tarea: taskId,
          id_cliente: clientId,
          fin_orden_trabajo: new Date().toISOString(),
          comentario_orden: "Trabajo completado exitosamente",
          id_usuario: userId,
        }
      );
      ToastAndroid.show(
        "Orden de trabajo completada con éxito",
        ToastAndroid.SHORT
      );

      console.log(
        `Orden de trabajo ${workOrderId} completada para el ticket ${taskId} y cliente ${clientId} actualizada`
      );
    } catch (error) {
      console.error(
        `Error completando la orden de trabajo ${workOrderId}: `,
        error
      );
    }
  },
};

export default FormCompletionTracker;
