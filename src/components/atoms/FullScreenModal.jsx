import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import Toolbar from '@components/atoms/Toolbar';
import PropTypes from "prop-types";

const FullScreenModal = ({ visible, onClose, title, children, showToolbar = true }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      {showToolbar && <Toolbar title={title} onBackPress={onClose} />}
      <View style={styles.content}>{children}</View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  }
});

FullScreenModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  useToolbar: PropTypes.bool
};

export default FullScreenModal;
