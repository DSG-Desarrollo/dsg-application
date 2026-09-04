import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "@core/theme";
import i18n from "@i18n/i18n";

const BAR_HEIGHT = 46;

const TicketSearchBar = ({ storageKey, onSearch, onClear }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadStoredSearch = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (!cancelled && stored) {
          setInputValue(stored);
          onSearch(stored);
        }
      } catch (e) {
        console.error("Error reading search term from storage", e);
      }
    };

    loadStoredSearch();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const handleSearch = async () => {
    const term = inputValue.trim();
    onSearch(term);
    try {
      if (term) {
        await AsyncStorage.setItem(storageKey, term);
      } else {
        await AsyncStorage.removeItem(storageKey);
      }
    } catch (e) {
      console.error("Error saving search term to storage", e);
    }
  };

  const handleClear = async () => {
    setInputValue("");
    onClear();
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch (e) {
      console.error("Error clearing search term from storage", e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <FontAwesomeIcon icon={faSearch} size={14} color="#9aa0a6" />
        <TextInput
          style={styles.input}
          placeholder={i18n.t("ticket:searchPlaceholder")}
          placeholderTextColor="#9aa0a6"
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          selectionColor={theme.colors.primary}
        />
        {inputValue.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            accessibilityLabel={i18n.t("ticket:clearSearch")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <FontAwesomeIcon icon={faTimes} size={14} color="#9aa0a6" />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearch}
        accessibilityLabel={i18n.t("ticket:search")}
      >
        <FontAwesomeIcon icon={faSearch} size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: BAR_HEIGHT,
    borderWidth: 1,
    borderColor: "#dcdfe3",
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: "100%",
    marginLeft: 8,
    fontSize: 15,
    color: "#1a1a1a",
    padding: 0,
    ...Platform.select({
      android: { textAlignVertical: "center" },
    }),
  },
  clearButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
  },
  searchButton: {
    marginLeft: 10,
    height: BAR_HEIGHT,
    width: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TicketSearchBar;
