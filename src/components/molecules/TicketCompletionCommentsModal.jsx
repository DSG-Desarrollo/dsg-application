import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import FullScreenModal from '@components/atoms/FullScreenModal';
import LimitedTextarea from '@components/atoms/LimitedTextarea';
import Card from '@components/molecules/Card';
import { buttonStyles } from '@themes';
import theme from '@themes/theme';

const { primary, primaryText } = buttonStyles;
const { textPrimary } = theme.colors;

const COMMENT_MAX_LENGTH = 500;

/**
 * Último paso antes de cerrar el ticket (después de capturar la firma del cliente en
 * TabInstallationSignatureProof): recolecta el comentario del cliente y el del técnico
 * — ambos opcionales — y es este "Guardar" el que de verdad dispara el cierre (finaliza
 * las OT activas y el ticket, y el correo a Monitoreo). Separado de la firma para no
 * mezclar "capturar la firma" con "escribir los comentarios finales".
 */
const TicketCompletionCommentsModal = ({ visible, onClose, onConfirm, isSubmitting = false }) => {
  const [comentarioCliente, setComentarioCliente] = useState('');
  const [comentarioFinalTecnico, setComentarioFinalTecnico] = useState('');

  const handleConfirm = () => {
    onConfirm({
      comentario_cliente: comentarioCliente.trim() || null,
      comentario_final_tecnico: comentarioFinalTecnico.trim() || null,
    });
  };

  return (
    <FullScreenModal visible={visible} onClose={onClose} title="Cerrar ticket">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card title="Comentarios finales" style={styles.card}>
          <Text style={styles.helperText}>
            Ambos comentarios son opcionales. Al guardar, se finalizan todas las órdenes
            de trabajo activas de este ticket y se notifica a Monitoreo.
          </Text>

          <Text style={styles.fieldLabel}>Comentario del cliente</Text>
          <LimitedTextarea
            value={comentarioCliente}
            onChangeText={setComentarioCliente}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder="¿Algo que el cliente haya indicado sobre el servicio?"
          />

          <Text style={styles.fieldLabel}>Comentario del técnico</Text>
          <LimitedTextarea
            value={comentarioFinalTecnico}
            onChangeText={setComentarioFinalTecnico}
            maxLength={COMMENT_MAX_LENGTH}
            placeholder="Notas finales sobre el trabajo realizado"
          />
        </Card>
      </ScrollView>

      <View style={styles.saveContainer}>
        <Pressable
          style={[primary, isSubmitting && { opacity: 0.6 }]}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={textPrimary} />
          ) : (
            <FontAwesomeIcon icon={faSave} size={16} color={textPrimary} />
          )}
          <Text style={primaryText}>{isSubmitting ? 'Guardando...' : 'Guardar y cerrar ticket'}</Text>
        </Pressable>
      </View>
    </FullScreenModal>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  helperText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  saveContainer: {
    padding: 16,
  },
});

export default TicketCompletionCommentsModal;
