import React, { useRef, useEffect } from "react";
import { Pressable, View, Text, Animated, StyleSheet } from "react-native";
import PropTypes from "prop-types";

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_SIZE = 22;
const THUMB_MARGIN = 2;

const Switch = ({ value, onValueChange, label, disabled, size }) => {
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
  const isSmall = size === "sm";
  const scale = isSmall ? 0.85 : 1;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (disabled) return;
    onValueChange(!value);
  };

  const thumbTranslate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [
      THUMB_MARGIN,
      TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN,
    ],
  });

  const trackColor = disabled
    ? "#E5E7EB" // theme.colors.border
    : value
    ? "#C9980A" // theme.colors.accent
    : "#D1D5DB"; // theme.colors.borderStrong

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      accessibilityLabel={label}
      style={[styles.row, disabled && styles.rowDisabled]}
    >
      {label ? (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.track,
          {
            width: TRACK_WIDTH * scale,
            height: TRACK_HEIGHT * scale,
            borderRadius: (TRACK_HEIGHT * scale) / 2,
            backgroundColor: trackColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: THUMB_SIZE * scale,
              height: THUMB_SIZE * scale,
              borderRadius: (THUMB_SIZE * scale) / 2,
              backgroundColor: disabled ? "#F3F4F6" : "#FFFFFF", // palette.gray[100] / white
              transform: [{ translateX: Animated.multiply(thumbTranslate, scale) }],
            },
          ]}
        />
      </View>
    </Pressable>
  );
};

Switch.propTypes = {
  value: PropTypes.bool.isRequired,
  onValueChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(["sm", "md"]),
};

Switch.defaultProps = {
  label: null,
  disabled: false,
  size: "md",
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  rowDisabled: {
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
    color: "#111827", // theme.colors.textDark
    flex: 1,
    marginRight: 12,
  },
  labelDisabled: {
    color: "#6B7280", // theme.colors.textMuted
  },
  track: {
    justifyContent: "center",
  },
  thumb: {
    position: "absolute",
  },
});

export default Switch;