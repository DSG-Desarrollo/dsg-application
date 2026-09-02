import React from 'react';
import { View, Modal } from 'react-native';
import Toolbar from '@components/atoms/Toolbar';

const FullScreenModal = ({ visible, onClose, title, children }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <Toolbar title={title} onBackPress={onClose} />
      <View style={{ flex: 1 }}>{children}</View>
    </Modal>
  );
};

export default FullScreenModal;
