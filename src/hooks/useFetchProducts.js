import React, { useState, useEffect, useCallback } from 'react';
import ProductsService from '@services/api/products/ProductsService';
import useNetworkState from './useNetworkState';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDatabase } from '@context/DatabaseContext';

// Columnas locales del catálogo de insumos del empleado (ver sql/tables/supplies.js).
// 'id_aprovisionamiento' es la clave de negocio: el mismo 'id' que trae el GraphQL.
const SUPPLY_COLUMNS = [
    'id_aprovisionamiento', 'employee_id', 'product_id', 'product_name',
    'quantity', 'brand', 'unit_of_measure', 'minimum', 'maximum',
];

const useFetchProducts = () => {
    const [userData, setUserData] = useState(null);
    const [productsData, setProductsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { networkState } = useNetworkState();
    const { getAllAsyncSql, runExclusive } = useDatabase();

    const productsService = new ProductsService();

    const userId = userData?.employee?.id_empleado;

    const fetchSavedSupplies = useCallback(async () => {
        if (!userId) return [];
        return (await getAllAsyncSql(
            `SELECT
                id_aprovisionamiento AS id,
                product_id AS productId,
                employee_id AS employeeId,
                product_name AS productName,
                quantity,
                brand,
                unit_of_measure AS unitOfMeasure,
                minimum,
                maximum
             FROM supplies WHERE employee_id = ?`,
            [userId]
        )) || [];
    }, [userId, getAllAsyncSql]);

    // 'id' (id_aprovisionamiento) es la clave de negocio para upsert — es global, no
    // hace falta combinarla con employee_id (ver SuppliesByUserId.php: es el PK propio
    // de la fila de aprovisionamiento).
    const saveSuppliesLocally = useCallback(async (supplies) => {
        if (!Array.isArray(supplies) || supplies.length === 0) return;
        try {
            await runExclusive(async (db) => {
                for (const supply of supplies) {
                    const values = [
                        supply.id,
                        userId,
                        supply.productId,
                        supply.productName,
                        supply.quantity,
                        supply.brand ?? null,
                        supply.unitOfMeasure,
                        supply.minimum,
                        supply.maximum,
                    ];
                    const existing = await db.getAllRows(
                        'SELECT id FROM supplies WHERE id_aprovisionamiento = ?',
                        [supply.id]
                    );
                    if (existing.length === 0) {
                        await db.executeSql(
                            `INSERT INTO supplies (${SUPPLY_COLUMNS.join(', ')}) VALUES (${SUPPLY_COLUMNS.map(() => '?').join(', ')})`,
                            values
                        );
                    } else {
                        const setClause = SUPPLY_COLUMNS.map((col) => `${col} = ?`).join(', ');
                        await db.executeSql(
                            `UPDATE supplies SET ${setClause} WHERE id_aprovisionamiento = ?`,
                            [...values, supply.id]
                        );
                    }
                }
            });
        } catch (error) {
            console.error('Error al guardar insumos en SQLite:', error);
        }
    }, [userId, runExclusive]);

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
            // Antes de que userData termine de cargar, userId es undefined y
            // userData es null — seguir de largo acá tiraba
            // "Cannot read properties of null (reading 'employee')" más abajo.
            if (!userId) {
                return;
            }

            if (!networkState.isConnected) {
                // Antes esta rama solo seteaba error y dejaba productsData vacío — sin
                // esto, la pestaña de Materiales no puede mostrar el catálogo offline.
                try {
                    setProductsData(await fetchSavedSupplies());
                } catch (error) {
                    console.error('Error al leer insumos guardados:', error);
                    setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.');
                } finally {
                    setLoading(false);
                }
                return;
            }

            try {
                const query = `
                    query($userId: ID!) {
                        suppliesByUserId(userId: $userId) {
                            id
                            productId,
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

                const variables = { userId };

                const responseWithFilter = await productsService.graphqlQuery(query, variables);
                console.log("Resultado de la api", responseWithFilter);
                if (Array.isArray(responseWithFilter)) {
                    setProductsData(responseWithFilter);
                    try {
                        await saveSuppliesLocally(responseWithFilter);
                    } catch (cacheError) {
                        console.error('Error al cachear insumos en SQLite:', cacheError);
                    }
                } else {
                    setError(responseWithFilter?.error || 'Error al obtener los datos.');
                }
            } catch (error) {
                console.log('Error al obtener los datos:', error);
                setError('Error al obtener los datos. Por favor, inténtalo de nuevo más tarde.!');
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, [userId, networkState.isConnected, fetchSavedSupplies, saveSuppliesLocally]);

    return { productsData, loading, error };
}

export default useFetchProducts;