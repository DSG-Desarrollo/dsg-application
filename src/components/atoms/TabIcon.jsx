import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export function TabIcon({ name, focused }) {
  return (
    <View>
      <Icon name={name} size={24} color={focused ? 'blue' : 'gray'} />
      <Text style={{ color: focused ? 'blue' : 'gray' }}>{name}</Text>
    </View>
  );
}
