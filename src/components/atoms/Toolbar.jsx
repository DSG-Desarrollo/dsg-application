import React from 'react';
import { View, Text, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { toolbarStyles } from '../../styles';
import Icon from 'react-native-vector-icons/Ionicons';

const Toolbar = ({ title, onBackPress }) => {
  return (
    <SafeAreaView style={[toolbarStyles.safeArea, Platform.OS === 'ios' && toolbarStyles.safeAreaIOS]}>
      <View style={[toolbarStyles.container, Platform.OS === 'ios' && toolbarStyles.containerIOS]}>
        {onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={toolbarStyles.iconContainer}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        )}
        <Text style={toolbarStyles.title}>{title}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Toolbar;
