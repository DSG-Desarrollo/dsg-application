import React, { useState, useEffect } from 'react';
import ProductsService from '../services/api/products/ProductsService';
import useNetworkState from './useNetworkState';

const useFetchProducts = () => {
    const productsService = new ProductsService();
    const [productsData, setProductsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { networkState } = useNetworkState();

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
                    userId: 7
                };

                const responseWithFilter = await productsService.graphqlQuery(query, variables);
                console.log("Resultado de la api", responseWithFilter);
                setProductsData(responseWithFilter);
                setLoading(false);
            } catch (error) {
                console.log('Error al obtener los datos:', error);
                setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.!');
                setLoading(false);
            }
        }

        fetchProducts();
    }, [networkState]);

    return { productsData, loading, error };

}

export default useFetchProducts;