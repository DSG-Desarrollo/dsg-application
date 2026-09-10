import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  Text,
  TextInput,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import useFetchProducts from "@hooks/useFetchProducts";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import { useWorkOrderFormCompletion } from '@context/WorkOrderFormCompletionContext';
import i18n from '@i18n/i18n';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { spacing, palette } from '@themes';
import WorkOrderRepository from '@repositories/WorkOrderRepository';

const { white } = palette;

// Styles
import { common as commonStyles, supplies as styles } from './styles';
import { buttonStyles } from '@themes';

const { primary, primaryText } = buttonStyles;

const TabWorkOrderSupplies = ({ route }) => {
  const { tareaId, clienteId, id_orden_trabajo } = route.params;
  const onFormCompleted = useWorkOrderFormCompletion();
  const [materialsSummary, setMaterialsSummary] = useState([]);
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

  const [productQuantities, setProductQuantities] = useState({});
  const { productsData, loading, error } = useFetchProducts();
  const workOrderRepository = WorkOrderRepository();
  const sortedProductsData = productsData.sort((a, b) =>
    a.productName.localeCompare(b.productName)
  );

  // Handle input change
  const handleQuantityChange = (id, value) => {
    setProductQuantities((prevQuantities) => ({
      ...prevQuantities,
      [id]: value,
    }));
  };

  // Offline-first: se lee siempre de SQLite local (materials_order), nunca de la API
  // directamente — la tabla se puebla en cada guardado exitoso (ver handleSave), con o
  // sin conexión, así que no hace falta un fetch de red para mostrar lo ya guardado.
  async function getWorderOrderMaterialsSummary() {
    try {
      const rows = await workOrderRepository.getLocalMaterials(id_orden_trabajo);
      setMaterialsSummary(rows);
    } catch (error) {
      console.error('Error al obtener los materiales:', error.message);
    }
  }

  useEffect(() => {
    getWorderOrderMaterialsSummary();
  }, []);

  useEffect(() => {
    if (!materialsSummary.length || !sortedProductsData.length) return;

    const summedByProductId = materialsSummary.reduce((acc, curr) => {
      const key = String(curr.id);
      acc[key] = (acc[key] || 0) + curr.cantidad;
      return acc;
    }, {});

    const hydrated = {};
    sortedProductsData.forEach((product) => {
      const key = String(product.id);
      if (summedByProductId[key] != null) {
        hydrated[product.id] = String(summedByProductId[key]);
      }
    });

    setProductQuantities((prev) => ({...hydrated, ...prev}));
  }, [materialsSummary, sortedProductsData]);

  const handleSave = async () => {
    setIsLoadingSendData(true);

    // Offline-first: escribe todas las líneas en SQLite local de inmediato (upsert/borrado
    // según cantidad, igual que sp_upsert_material_orden) y encola el batch completo para
    // que SyncManager lo mande a POST /api/materials-order en cuanto haya conexión (ver
    // WorkOrderRepository.saveMaterials). Antes esto llamaba a ApiService.sendFormData
    // directo: sin conexión, esa llamada fallaba y además el catch de ApiService tragaba
    // el error sin relanzarlo ni devolver nada, dejando `response` undefined — el
    // `response.status` de más abajo tiraba abajo la pantalla.
    const lines = sortedProductsData.map((product) => ({
      id_aprovisionamiento: product.id,
      cantidad: parseInt(productQuantities[product.id] || "0", 10),
    }));

    try {
      await workOrderRepository.saveMaterials(tareaId, id_orden_trabajo, lines);
      ToastAndroid.show('Materiales guardados correctamente.', ToastAndroid.LONG);

      if (userData?.employee?.id_usuario_empleado) {
        await FormCompletionTracker.markFormAsCompleted(
          "form_work_order_supplies",
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
      console.error('Error al guardar los materiales:', error.message);
      ToastAndroid.show('No se pudieron guardar los materiales.', ToastAndroid.LONG);
    } finally {
      setIsLoadingSendData(false);
    }
  };

  const handleStep = (id, delta) => {
    setProductQuantities((prev) => {
      const current = parseInt(prev[id] || "0", 10);
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next === 0 ? "" : String(next) };
    });
  };

  const filledCount = Object.values(productQuantities).filter(
    (v) => v && parseInt(v, 10) > 0
  ).length;

  return (
    <View style={commonStyles.container}>
      <View style={styles.progressHeader}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>{i18n.t('workOrder:materials')}</Text>
          <Text style={styles.progressCount}>
            {filledCount} de {sortedProductsData.length} con cantidad
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  sortedProductsData.length
                    ? (filledCount / sortedProductsData.length) * 100
                    : 0
                }%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={commonStyles.scrollViewContent}>
        {sortedProductsData.map((product, index) => {
          const qty = parseInt(productQuantities[product.id] || "0", 10);

          return (
            <View
              key={product.id}
              style={[
                styles.row,
                index === sortedProductsData.length - 1 && styles.rowLast,
              ]}
            >
              <View style={styles.rowInfo}>
                <View
                  style={[
                    styles.statusDot,
                    qty > 0 && styles.statusDotFilled,
                  ]}
                />
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.productName} numberOfLines={0}>
                    {product.productName}
                  </Text>
                  <Text style={styles.productUnit}>
                    {product.unitOfMeasure}
                  </Text>
                </View>
              </View>

              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleStep(product.id, -1)}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.stepperInput}
                  keyboardType="numeric"
                  value={productQuantities[product.id] || "0"}
                  onChangeText={(value) =>
                    handleQuantityChange(product.id, value)
                  }
                />
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => handleStep(product.id, 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
        
      </ScrollView>
      <View style={styles.saveContainer}>
        <Pressable style={primary} onPress={handleSave} disabled={isLoadingSendData}>
          {isLoadingSendData ?
            (
              <ActivityIndicator size="small" color={white} />
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} size={16} color={white} />
                <Text style={primaryText}>{i18n.t('ui:btnSave')}</Text>
              </>
            )
          }
        </Pressable>
      </View>
    </View>
  );
};

export default TabWorkOrderSupplies;
