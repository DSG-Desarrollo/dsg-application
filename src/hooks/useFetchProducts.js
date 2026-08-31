import React, { useState, useEffect } from 'react';
import ProductsService from '@services/api/products/ProductsService';
import useNetworkState from './useNetworkState';
import AsyncStorage from "@react-native-async-storage/async-storage";

const useFetchProducts = () => {
    const [userData, setUserData] = useState(null);
    const [productsData, setProductsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { networkState } = useNetworkState();

    const productsService = new ProductsService();

    const userId = userData?.employee?.id_empleado;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("userData");
                setUserData(jsonValue ? JSON.parse(jsonValue) : null);
            } catch (e) {
                console.error("Error reading userData from storage", e);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!networkState.isConnected) {
                setError('No hay conexión de red');
                setLoading(false);
                return;
            }
            try {
                const query = `
                    query($userId: ID!) {
                        suppliesByUserId(userId: $userId) {
                            id
                            employeeId
                            productName
                            quantity
                            brand
                            unitOfMeasure
                            minimum
                            maximum
                        }
                    }
                `;

                const variables = {
                    userId: userData.employee.id_empleado
                };

                const responseWithFilter = await productsService.graphqlQuery(query, variables);
                console.log("Resultado de la api", responseWithFilter);
                setProductsData(responseWithFilter);
            } catch (error) {
                console.log('Error al obtener los datos:', error);
                setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.!');
                setLoading(false);
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [userId, networkState]);

    return { productsData, loading, error };
}

export default useFetchProducts;