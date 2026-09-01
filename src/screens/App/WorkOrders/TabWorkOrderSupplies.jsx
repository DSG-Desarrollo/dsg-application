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
import { faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import useFetchProducts from "@hooks/useFetchProducts";
import ApiService from "@services/api/ApiService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import i18n from '@i18n/i18n';
import { HTTP_CODES } from "@constants";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

const { OK, CREATED } = HTTP_CODES;

// Services
import workOrderService from "@services/api/workorder.service";
const { getWorkOrdersMaterialsSummary } = workOrderService;

// Styles
import { common as commonStyles, supplies as styles } from './styles';
import { buttonStyles } from '@themes';

const { primary, primaryText } = buttonStyles;

const TabWorkOrderSupplies = ({ route }) => {
  const { tareaId, clienteId, id_orden_trabajo } = route.params;
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

  async function getWorderOrderMaterialsSummary() {
    try {
      const response = await getWorkOrdersMaterialsSummary(id_orden_trabajo);
      if (response?.success && Array.isArray(response.data)) {
        setMaterialsSummary(response.data);
      }
    } catch (error) {
      console.error('Error al obtener los materiales:', error.message);
    } finally {
      setIsLoadingSendData(false);
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
    const apiService = new ApiService();

    const data = sortedProductsData
    .map((product) => ({
      id_orden_trabajo: id_orden_trabajo,
      id_aprovisionamiento: product.id,
      cantidad: parseInt(productQuantities[product.id] || "0", 10),
    }));

    console.log("Datos enviados", data);

    const endpoint = "api/materials-order";
    const response = await apiService.sendFormData(data, endpoint);

    await FormCompletionTracker.markFormAsCompleted(
      "form_work_order_supplies",
      clienteId,
      tareaId,
      id_orden_trabajo,
      userData.employee.id_usuario_empleado
    );

    console.info("Respuesta de la API:", response);
    if ([OK, CREATED].includes(response.status)) {
      ToastAndroid.show(response.message, ToastAndroid.LONG);
    }
    setIsLoadingSendData(false);
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

      <Pressable style={primary} onPress={handleSave} disabled={isLoadingSendData}>
        {isLoadingSendData ?
          (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <FontAwesomeIcon icon={faSave} size={16} color="#ffffff" />
              <Text style={primaryText}>{i18n.t('ui:btnSave')}</Text>
            </>
          )
        }
      </Pressable>
    </View>
  );
};

export default TabWorkOrderSupplies;
