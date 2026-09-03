'use strict';

/**
 * Reemplaza el Blob global de React Native por el de `expo-blob` (nativo, sin el
 * round-trip por base64 que usa RN para materializar Response.blob()). Se importa
 * como primera línea del entry point (App.js) para que quede instalado antes de
 * cualquier fetch/FormData de la app.
 *
 * `expo-blob` trae código nativo, por lo que solo está disponible en un dev client
 * o en el build final (APK/IPA) — en Expo Go el módulo no está linkeado. Por eso el
 * require se protege: si falla, la app sigue funcionando con el Blob de React Native
 * (más lento, pero funcional) en vez de truena.
 */
try {
  const { Blob: ExpoBlob } = require('expo-blob');
  globalThis.Blob = ExpoBlob;
} catch (error) {
  // Módulo nativo no disponible en este runtime (p. ej. Expo Go): se mantiene el Blob de RN.
}
