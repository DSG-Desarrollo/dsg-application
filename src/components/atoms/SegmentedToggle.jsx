// SegmentedToggle.js
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

const SegmentedToggle = ({ options, value, onChange, error }) => (
  <View>
    <View style={[styles.row, error && styles.rowError]}>
      {options.map((opt, index) => {
        const isSelected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              isSelected && styles.segmentSelected,
              index > 0 && styles.segmentDivider,
            ]}
          >
            <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
    {error && (
      <View style={styles.errorContainer}>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  rowError: {
    borderColor: "#C0392B",
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  segmentDivider: {
    borderLeftWidth: 1,
    borderLeftColor: "#ddd",
  },
  segmentSelected: {
    backgroundColor: "#003F75",
  },
  segmentText: {
    fontSize: 13,
    color: "#555",
  },
  segmentTextSelected: {
    color: "#FAEEDA",
    fontWeight: "600",
  },
  errorContainer: {
    marginTop: 6,
  },
  errorMessage: {
    fontSize: 12,
    color: "#C0392B",
  },
});

export default SegmentedToggle;