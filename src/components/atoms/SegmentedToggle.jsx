// SegmentedToggle.js
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from '@context/ThemeContext';

const SegmentedToggle = ({ options, value, onChange, error, disabled = false }) => {
  const { colors } = useTheme();
  const styles = createSegmentedToggleStyles(colors);

  return (
    <View>
      <View style={[styles.row, error && styles.rowError, disabled && styles.rowDisabled]}>
        {options.map((opt, index) => {
          const isSelected = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => !disabled && onChange(opt.value)}
              disabled={disabled}
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
};

const createSegmentedToggleStyles = (colors) => StyleSheet.create({
  row: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.border,
  },

  rowError: {
    borderColor: colors.danger,
  },

  rowDisabled: {
    opacity: 0.6,
  },

  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },

  segmentDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },

  segmentSelected: {
    backgroundColor: colors.primary,
  },

  segmentText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  segmentTextSelected: {
    color: '#FFFFFF',
    fontWeight: "600",
  },

  errorContainer: {
    marginTop: 6,
  },

  errorMessage: {
    fontSize: 12,
    color: colors.danger,
  },
});

export default SegmentedToggle;