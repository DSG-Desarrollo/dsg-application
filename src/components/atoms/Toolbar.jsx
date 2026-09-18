import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toolbarStyles } from "../../styles";
import Icon from "react-native-vector-icons/Ionicons";

const Toolbar = ({ title, onBackPress }) => {
  // El Toolbar se usa tanto dentro del flujo normal de pantallas (donde el
  // SafeAreaView del App raíz ya deja espacio para la barra de estado) como
  // dentro de FullScreenModal (React Native <Modal>, que se monta en una
  // ventana nativa aparte y no hereda ese espacio). Por eso el propio Toolbar
  // debe sumar el inset superior en vez de asumir que alguien más lo hizo.
  const insets = useSafeAreaInsets();

  return (

      <View
        style={[
          toolbarStyles.container,
          Platform.OS === "ios" && toolbarStyles.containerIOS,
          { height: 56 + insets.top, paddingTop: insets.top },
        ]}
      >
        {onBackPress && (
          <TouchableOpacity
            onPress={onBackPress}
            style={toolbarStyles.iconContainer}
            accessibilityLabel="Back Button"
            accessibilityRole="button"
          >
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text style={toolbarStyles.title}>{title}</Text>
      </View>

  );
};

export default Toolbar;
