import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ToastAndroid
} from "react-native";
import { faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import ActionButtons from "@components/atoms/ActionButtons";
import useFetchProducts from "@hooks/useFetchProducts";
import ApiService from "@services/api/ApiService";
import AsyncStorage from '@react-native-async-storage/async-storage';
import FormCompletionTracker from "@components/atoms/FormCompletionTracker";
import Card from '@components/molecules/Card';

// Styles
import { spacing } from '@themes';
import { common as commonStyles } from './styles';

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

  return (
    <View style={commonStyles.container}>
    <ScrollView contentContainerStyle={commonStyles.scrollViewContent}>
      {/*<View style={styles.headerContainer}>
        <Text style={styles.header}>Materiales usados</Text>
      </View>*/}
      
        {sortedProductsData.map((product) => (
          <Card key={product.id} style={{ marginBottom: spacing.md }}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.productName}</Text>
              <Text style={styles.productUnit}>{product.unitOfMeasure}</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cantidad usada"
              keyboardType="numeric"
              value={productQuantities[product.id] || ""}
              onChangeText={(value) => handleQuantityChange(product.id, value)}
            />
          </Card>
        ))}
      
      <View style={styles.buttonsContainer}>
        <ActionButtons
          buttons={buttons}
          buttonContainerStyle={styles.customButtonContainer}
          buttonStyle={styles.customButton}
          buttonTextStyle={styles.customButtonText}
        />
      </View>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

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
  productName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  productUnit: {
    fontSize: 16,
    color: '#888',
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
});

export default TabWorkOrderSupplies;
