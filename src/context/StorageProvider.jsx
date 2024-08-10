import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Crear el contexto
const StorageContext = createContext();

// Proveedor del contexto
export const StorageProvider = ({ children }) => {
  const [collections, setCollections] = useState({});

  // Obtener datos de una colección
  const getCollection = async (key) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(
        `Error al obtener los datos de la colección ${key}:`,
        error
      );
      return null;
    }
  };

  // Guardar una nueva colección de datos
  const saveCollection = async (key, value) => {
    try {
      const existingCollection = await AsyncStorage.getItem(key);
      if (existingCollection) {
        console.warn(
          `La colección ${key} ya existe. Usa la función updateCollection para actualizarla.`
        );
        return;
      }
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setCollections((prev) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error(`Error al guardar la nueva colección ${key}:`, error);
    }
  };

  // Guardar una nueva colección con estructura de datos compleja
  const saveComplexCollection = async (key, value) => {
    try {
      const existingCollection = await AsyncStorage.getItem(key);
      if (existingCollection) {
        console.warn(
          `La colección ${key} ya existe. Usa la función updateComplexCollection para actualizarla.`
        );
        return;
      }
      // Serializamos el objeto complejo a JSON y lo guardamos
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setCollections((prev) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error(`Error al guardar la nueva colección ${key}:`, error);
    }
  };

  // Actualizar una colección existente
  const updateCollection = async (key, newValue) => {
    try {
      const existingCollection = await AsyncStorage.getItem(key);
      if (!existingCollection) {
        console.warn(
          `La colección ${key} no existe. Usa la función saveCollection para crearla.`
        );
        return;
      }
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
      setCollections((prev) => ({ ...prev, [key]: newValue }));
    } catch (error) {
      console.error(`Error al actualizar la colección ${key}:`, error);
    }
  };

  // Actualizar una colección con estructura de datos compleja
  const updateComplexCollection = async (key, newValue) => {
    try {
      const existingCollection = await AsyncStorage.getItem(key);
      if (!existingCollection) {
        console.warn(
          `La colección ${key} no existe. Usa la función saveComplexCollection para crearla.`
        );
        return;
      }
      // Serializamos el nuevo objeto complejo a JSON y actualizamos
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
      setCollections((prev) => ({ ...prev, [key]: newValue }));
    } catch (error) {
      console.error(`Error al actualizar la colección ${key}:`, error);
    }
  };

  // Eliminar una colección
  const removeCollection = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      setCollections((prev) => {
        const updatedCollections = { ...prev };
        delete updatedCollections[key];
        return updatedCollections;
      });
    } catch (error) {
      console.error(`Error al eliminar la colección ${key}:`, error);
    }
  };

  // Obtener los datos iniciales de todas las colecciones que quieras manejar al cargar la app
  useEffect(() => {
    const fetchAllCollections = async () => {
      const keys = ["userData", "otherData"]; // Aquí se pueden agregar los nombres de otras colecciones
      const fetchedCollections = {};
      for (const key of keys) {
        fetchedCollections[key] = await getCollection(key);
      }
      setCollections(fetchedCollections);
    };

    fetchAllCollections();
  }, []);

  return (
    <StorageContext.Provider
      value={{ collections, saveCollection, saveComplexCollection, getCollection, setCollections, removeCollection }}
    >
      {children}
    </StorageContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useStorage = () => useContext(StorageContext);
