import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SelectManager from "../atoms/SelectManager";
import DateTimePicker from "@react-native-community/datetimepicker";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faCalendarAlt,
  faSearch,
  faRedoAlt,
} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import "moment/locale/es";

moment.locale("es");

const FILTER_STORAGE_KEY = "searchFilter";

const SearchFilter = ({ onFilterChange }) => {
  const [date, setDate] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recordsLimit, setRecordsLimit] = useState(10);

  // Cargar filtros desde AsyncStorage
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const savedFilters = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
        if (savedFilters) {
          const { date, searchText, recordsLimit } = JSON.parse(savedFilters);
          setDate(date ? new Date(date) : null);
          setSearchText(searchText || "");
          setRecordsLimit(recordsLimit || 10);
          onFilterChange({
            date: date ? new Date(date) : null,
            searchText,
            recordsLimit,
          });
        }
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };

    loadFilters();
  }, []);

  // Guardar filtros en AsyncStorage
  const saveFilters = async (filters) => {
    try {
      await AsyncStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error("Error saving filters:", error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    const filters = { date: currentDate, searchText, recordsLimit };
    onFilterChange(filters);
    saveFilters(filters);
  };

  const onSearchTextChange = (text) => {
    setSearchText(text);
    const filters = { date, searchText: text, recordsLimit };
    onFilterChange(filters);
    saveFilters(filters);
  };

  const onRecordsLimitChange = (limit) => {
    setRecordsLimit(limit);
    const filters = { date, searchText, recordsLimit: limit };
    onFilterChange(filters);
    saveFilters(filters);
  };

  const resetFilters = async () => {
    setDate(null);
    setSearchText("");
    setRecordsLimit(10);
    const filters = { date: null, searchText: "", recordsLimit: 10 };
    onFilterChange(filters);
    await AsyncStorage.removeItem(FILTER_STORAGE_KEY);
  };

  // Datos para el SelectManager
  const recordOptions = [
    { label: "10", value: 10 },
    { label: "20", value: 20 },
    { label: "30", value: 30 },
    { label: "40", value: 40 },
    { label: "50", value: 50 },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.searchContainer}>
        <FontAwesomeIcon
          icon={faSearch}
          size={20}
          color="#007AFF"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Buscar..."
          value={searchText}
          onChangeText={onSearchTextChange}
        />
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowDatePicker(true)}
        >
          <FontAwesomeIcon icon={faCalendarAlt} size={24} color="#007AFF" />
          {showDatePicker && (
            <DateTimePicker
              value={date || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </TouchableOpacity>

        <SelectManager
          data={recordOptions}
          onValueChange={onRecordsLimitChange}
          value={recordsLimit}
          placeholder={{ label: "Seleccionar cantidad", value: null }}
          style={styles.picker}
        />

        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <FontAwesomeIcon icon={faRedoAlt} size={24} color="#FF0000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f0f0f0", // Fondo neutro para destacar los elementos interactivos
    borderRadius: 12,
    padding: 15,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff", // Color de fondo claro para el campo de búsqueda
    borderRadius: 8,
    marginBottom: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    paddingHorizontal: 10,
    color: "#0078D7", // Color inspirado en el estilo Metro
  },
  input: {
    flex: 1,
    fontSize: 18, // Tipografía ligeramente más grande
    color: "#333",
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  picker: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#f5f5f5", // Color claro para un look moderno y suave
    paddingVertical: 12, // Aumenta el padding vertical para más espacio en la selección
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 }, // Sombras más marcadas para mayor profundidad
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default SearchFilter;
