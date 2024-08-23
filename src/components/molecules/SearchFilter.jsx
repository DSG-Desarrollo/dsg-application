import React, { useState, useEffect } from "react";
import { View, TextInput } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const SearchFilter = ({ onFilterChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    onFilterChange({ startDate, endDate, searchText });
  }, [startDate, endDate, searchText]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <DateTimePicker
        value={startDate || new Date()}
        mode="date"
        display="default"
        onChange={(event, date) => setStartDate(date)}
        style={styles.input}
      />
      <DateTimePicker
        value={endDate || new Date()}
        mode="date"
        display="default"
        onChange={(event, date) => setEndDate(date)}
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 8,
    marginVertical: 10,
    borderRadius: 5,
  },
});

export default SearchFilter;
