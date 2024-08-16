import React, { memo } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import PropTypes from "prop-types";

const ActionButtons = ({
  buttons,
  buttonContainerStyle,
  buttonStyle,
  buttonTextStyle,
  iconSize = 24,
  iconColor = "#fff",
}) => {
  return (
    <View style={[styles.buttonContainer, buttonContainerStyle]}>
      {buttons.map((button, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.button, buttonStyle, button.style]}
          onPress={button.onPress}
          accessibilityLabel={button.accessibilityLabel || button.text}
          accessible={true}
        >
          <FontAwesomeIcon
            icon={button.icon}
            size={iconSize}
            color={iconColor}
          />
          <Text style={[styles.buttonText, buttonTextStyle, button.textStyle]}>
            {button.text}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

ActionButtons.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.object.isRequired,
      onPress: PropTypes.func.isRequired,
      style: PropTypes.object,
      textStyle: PropTypes.object,
      iconSize: PropTypes.number,
      iconColor: PropTypes.string,
      accessibilityLabel: PropTypes.string,
    })
  ).isRequired,
  buttonContainerStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
  buttonTextStyle: PropTypes.object,
  iconSize: PropTypes.number,
  iconColor: PropTypes.string,
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff", // Color de fondo moderno
    borderRadius: 10, // Bordes más redondeados
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 5,

  },
  buttonText: {
    marginLeft: 10,
    color: "#fff", // Texto blanco para buen contraste
    fontSize: 16,
    fontWeight: "600", // Fuente más audaz para destacar
  },
});

export default memo(ActionButtons);
