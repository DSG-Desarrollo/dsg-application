import React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const FabButton = ({
  icon,
  onPress,
  backgroundColor,
  iconColor = '#FFFFFF',
  iconSize = 24,
  style,
  ...props
}) => {
  return (
    <FAB
      icon={() => (
        <FontAwesomeIcon
          icon={icon}
          size={iconSize}
          color={iconColor}
        />
      )}
      style={[
        styles.fab,
        { backgroundColor },
        style,
      ]}
      onPress={onPress}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default FabButton;

