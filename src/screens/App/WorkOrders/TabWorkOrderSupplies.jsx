import React from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import useFetchProducts from '../../../hooks/useFetchProducts';

const TabWorkOrderSupplies = () => {
  const { productsData, loading, error } = useFetchProducts();
  const sortedProductsData = productsData.sort((a, b) => a.productName.localeCompare(b.productName));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Materiales usados</Text>
      {sortedProductsData.map((product) => (
        <View key={product.id} style={styles.productContainer}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.productName}</Text>
            <Text style={styles.productUnit}>{product.unitOfMeasure}</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Cantidad usada"
            keyboardType="numeric"
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
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
});

export default TabWorkOrderSupplies;
