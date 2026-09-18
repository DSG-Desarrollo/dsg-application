import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toolbar from '@components/atoms/Toolbar';
import { useTheme } from '@context/ThemeContext';
import PropTypes from "prop-types";

const FullScreenModal = ({ visible, onClose, title, children, showToolbar = true }) => {
  // RN <Modal> se monta en su propia ventana nativa: no hereda el padding
  // inferior del SafeAreaView del App raíz, así que botones/acciones pegados
  // al fondo (p.ej. "Guardar", o la hoja "Tomar foto"/"Elegir de galería")
  // quedaban tapados por la barra de navegación del sistema.
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      {showToolbar && <Toolbar title={title} onBackPress={onClose} />}
      <View style={[styles.content, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>{children}</View>
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
