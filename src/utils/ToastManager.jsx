import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

class ToastManager {
  /**
   * Muestra una tostada con un mensaje personalizado.
   *
   * @param {string} message - El mensaje que se mostrará en la tostada.
   * @param {string} type - Tipo de tostada (success, error, info, warning).
   */
  static showToast(message, type = 'success') {
    Toast.show({
      text1: message,
      type: type,
    });
  }

  /**
   * Muestra una tostada de éxito.
   *
   * @param {string} message - El mensaje de éxito.
   */
  static showSuccess(message) {
    this.showToast(message, 'success');
  }

  /**
   * Muestra una tostada de error.
   *
   * @param {string} message - El mensaje de error.
   */
  static showError(message) {
    this.showToast(message, 'error');
  }

  /**
   * Muestra una tostada de información.
   *
   * @param {string} message - El mensaje de información.
   */
  static showInfo(message) {
    this.showToast(message, 'info');
  }

  /**
   * Muestra una tostada de advertencia.
   *
   * @param {string} message - El mensaje de advertencia.
   */
  static showWarning(message) {
    this.showToast(message, 'warning');
  }
}

export default ToastManager;
