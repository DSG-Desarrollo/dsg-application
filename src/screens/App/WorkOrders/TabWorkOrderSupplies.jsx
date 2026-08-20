import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ToastAndroid,
  TouchableOpacity,
} from "react-native";
import { faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import ActionButtons from "@components/atoms/ActionButtons";
import useFetchProducts from "@hooks/useFetchProducts";
import ApiService from "@services/api/ApiService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";

// Styles
import { spacing, palette } from '@themes';
import { common as commonStyles } from './styles';

const { white } = palette;

const TabWorkOrderSupplies = ({ route }) => {
  const { tareaId, clienteId, id_orden_trabajo } = route.params;
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

  const handleSave = async () => {
    const apiService = new ApiService();
    const data = sortedProductsData
      .filter(
        (product) =>
          productQuantities[product.id] &&
          parseInt(productQuantities[product.id], 10) > 0
      )
      .map((product) => ({
        id_orden_trabajo: id_orden_trabajo,
        id_aprovisionamiento: product.id,
        cantidad: parseInt(productQuantities[product.id], 10),
      }));

    const endpoint = "api/materials-order";
    const response = await apiService.sendFormData(data, endpoint);

    await FormCompletionTracker.markFormAsCompleted(
      "form_work_order_supplies",
      clienteId,
      tareaId,
      id_orden_trabajo,
      userData.employee.id_usuario_empleado
    );

    console.log("Respuesta de la API:", response);
    if (response.status === 201) {
      ToastAndroid.show(response.message, ToastAndroid.LONG);
    }
  };

  const handleEdit = () => {};

  const buttons = [
    { text: "Guardar", icon: faSave, onPress: handleSave },
    { text: "Editar", icon: faEdit, onPress: handleEdit },
  ];

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
          <Text style={styles.progressLabel}>Materiales</Text>
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

      <View style={styles.buttonsContainer}>
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
  progressHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, fontWeight: '500', color: '#333' },
  progressCount: { fontSize: 13, color: '#888' },
  progressTrack: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#BA7517', borderRadius: 4 },

  headerContainer: {
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  productsContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  rowLast: { borderBottomWidth: 0 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },
  statusDotFilled: { backgroundColor: '#639922' },
  productName: { fontSize: 14, fontWeight: '500', color: '#333' },
  productUnit: { fontSize: 12, color: '#999' },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  stepperBtnText: { fontSize: 16, color: '#555' },
  stepperInput: {
    width: 30,
    height: 38,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    padding: 0,
  },

  input: {
    width: 80,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    textAlign: 'center',
    color: '#333',
  },
  buttonsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  customButtonContainer: {
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
  },
  saveContainer: {
    padding: 16,
    backgroundColor: white,
  }
});

export default TabWorkOrderSupplies;
