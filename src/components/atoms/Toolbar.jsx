import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toolbarStyles } from "../../styles";
import Icon from "react-native-vector-icons/Ionicons";

const Toolbar = ({ title, onBackPress }) => {
  return (

      <View
        style={[
          toolbarStyles.container,
          Platform.OS === "ios" && toolbarStyles.containerIOS,
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
