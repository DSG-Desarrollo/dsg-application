import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

/**
 * Átomo reutilizable para dar feedback visual de que hay una petición al
 * servidor en curso (login, guardar un formulario, cargar una lista, etc.).
 *
 * Envuelve el contenido (`children`) y, mientras `visible` es true, muestra
 * un velo oscuro con fade in/out encima de TODA la pantalla/sección,
 * capturando el toque para que el usuario no pueda volver a pulsar nada
 * hasta que la petición termine.
 */
export default function LoadingOverlay({
  visible = false,
  children,
  size = 'large',
  color = '#003F75',
  overlayColor = 'rgba(0, 0, 0, 0.4)',
  text,
  fullscreen = false,
  style,
}) {
  const { width, height } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(0)).current;
  const [rendered, setRendered] = useState(visible);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished) setRendered(false);
        }
      );
    }
  }, [visible, opacity]);

  const card = (
    <View style={styles.card}>
      <ActivityIndicator size={size} color={color} />
      {text ? <Text style={[styles.text, { color: '#333333' }]}>{text}</Text> : null}
    </View>
  );

  return (
    <View style={[styles.wrapper, fullscreen && styles.fullscreen]}>
      {children}
      {fullscreen ? (
        // <Modal> se pinta en su propia ventana nativa, fuera del árbol de
        // layout de `children` — su animación de entrada/salida ("fade") la
        // maneja el propio sistema operativo, así que no necesita el fade
        // manual por Animated.Value ni el `elevation` hack (eso solo hacía
        // falta cuando el overlay vivía como hermano del botón en el mismo
        // árbol). El ancho/alto se fija con `useWindowDimensions()` en vez
        // de depender de `absoluteFillObject`, que solo llena la pantalla si
        // el ancestro inmediato ya se midió con esas dimensiones en ese
        // instante — en Android real eso se resolvía a un alto ~0, pintando
        // la tarjeta arriba a la izquierda con overflow.
        <Modal transparent visible={visible} animationType="fade" onRequestClose={() => {}}>
          <View
            pointerEvents="auto"
            style={[styles.overlay, { top: 0, left: 0, width, height, backgroundColor: overlayColor }, style]}
          >
            {card}
          </View>
        </Modal>
      ) : (
        rendered && (
          <Animated.View
            pointerEvents="auto"
            style={[styles.overlay, styles.overlayLocal, { opacity, backgroundColor: overlayColor }, style]}
          >
            {card}
          </Animated.View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  fullscreen: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayLocal: {
    // Solo aplica al modo no-fullscreen, donde el overlay vive en el mismo
    // árbol que sus hermanos (no dentro de un <Portal>). Ahí sí puede haber
    // pelea de stacking con vistas que usan `elevation` (p.ej. el botón
    // "contained" de react-native-paper), así que necesita ganarles.
    ...StyleSheet.absoluteFillObject,
    elevation: 999,
    zIndex: 999,
  },
  card: {
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  text: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
