// components/atoms/Button.js
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from "react-native";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";

const VARIANT_STYLES = {
  primary: {
    bg: "#003F75",       // theme.colors.primary
    bgDisabled: "#A0A0A0",
    text: "#FFFFFF",     // theme.colors.textInverse
    border: null,
  },
  accent: {
    bg: "#C9980A",       // theme.colors.accent
    bgDisabled: "#D9C48F",
    text: "#FFFFFF",
    border: null,
  },
  danger: {
    bg: "#CD060E",       // theme.colors.danger
    bgDisabled: "#E39A9D",
    text: "#FFFFFF",
    border: null,
  },
  success: {
    bg: "#4CAF50",       // theme.colors.success
    bgDisabled: "#A8D5AA",
    text: "#FFFFFF",
    border: null,
  },
  outline: {
    bg: "#FFFFFF",
    bgDisabled: "#F3F4F6", // palette.gray[100]
    text: "#4B5563",     // theme.colors.textSecondary
    textDisabled: "#9CA3AF", // palette.gray[400]
    border: "#D1D5DB",   // theme.colors.borderStrong
    borderDisabled: "#E5E7EB",
  },
  ghost: {
    bg: "transparent",
    bgDisabled: "transparent",
    text: "#003F75",     // theme.colors.primary
    textDisabled: "#9CA3AF",
    border: null,
  },
};

const SIZE_STYLES = {
  sm: { height: 38, fontSize: 13, iconSize: 13, paddingHorizontal: 16, spinnerSize: "small" },
  md: { height: 46, fontSize: 14, iconSize: 15, paddingHorizontal: 20, spinnerSize: "small" },
  lg: { height: 52, fontSize: 15, iconSize: 16, paddingHorizontal: 24, spinnerSize: "small" },
};

const LoadingButton = ({
  onPress,
  title,
  icon,
  iconPosition,
  variant,
  size,
  isLoading,
  loadingText,
  disabled,
  fullWidth,
  style,
  textStyle,
}) => {
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const s = SIZE_STYLES[size] || SIZE_STYLES.md;
  const isDisabled = disabled || isLoading;

  const backgroundColor = isDisabled ? v.bgDisabled : v.bg;
  const textColor = isDisabled ? (v.textDisabled || "#FFFFFF") : v.text;
  const borderColor = v.border ? (isDisabled ? v.borderDisabled || v.border : v.border) : null;
  const spinnerColor = variant === "outline" || variant === "ghost" ? v.text : "#FFFFFF";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor,
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          borderWidth: borderColor ? 1 : 0,
          borderColor: borderColor || "transparent",
          width: fullWidth ? "100%" : undefined,
        },
        style,
      ]}
    >
      {isLoading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator size={s.spinnerSize} color={spinnerColor} />
          {loadingText ? (
            <Text style={[styles.text, { color: textColor, fontSize: s.fontSize }, textStyle]}>
              {loadingText}
            </Text>
          ) : null}
        </View>
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === "left" && (
            <FontAwesomeIcon icon={icon} size={s.iconSize} color={textColor} />
          )}
          <Text style={[styles.text, { color: textColor, fontSize: s.fontSize }, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === "right" && (
            <FontAwesomeIcon icon={icon} size={s.iconSize} color={textColor} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

LoadingButton.propTypes = {
  onPress: PropTypes.func,
  title: PropTypes.string.isRequired,
  icon: PropTypes.object,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  variant: PropTypes.oneOf(["primary", "accent", "danger", "success", "outline", "ghost"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
};

LoadingButton.defaultProps = {
  onPress: () => {},
  icon: null,
  iconPosition: "left",
  variant: "primary",
  size: "md",
  isLoading: false,
  loadingText: null,
  disabled: false,
  fullWidth: true,
  style: null,
  textStyle: null,
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontWeight: "600",
  },
});

export default LoadingButton;