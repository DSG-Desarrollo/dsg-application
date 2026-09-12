// utils/httpErrorHandler.js
import { HTTP_CODES } from '@constants';

const {
    BAD_REQUEST,
    UNAUTHORIZED,
    FORBIDDEN,
    NOT_FOUND,
    INTERNAL_SERVER_ERROR,
 } = HTTP_CODES;

/**
 * Método para manejar los errores devueltos por las solicitudes HTTP.
 * @param {Error} error - El error capturado durante la solicitud HTTP.
 * @throws {Error} - Lanza un error con un mensaje descriptivo del error ocurrido.
 */
export const handleHttpError = (error) => {
    if (!error.response) {
        // Si no hay una respuesta, puede ser un error de red
        throw new Error('Error de red. Por favor, verifica tu conexión e inténtalo de nuevo.');
    }

    // Extraer el código de estado y el mensaje del error de la respuesta
    const { status, data } = error.response;

    // Manejar los errores más comunes basados en el código de estado
    switch (status) {
        case BAD_REQUEST:
            throw new Error(`Error de solicitud: ${data.message || 'Datos de solicitud inválidos.'}`);
        case UNAUTHORIZED:
            throw new Error(`Error de autorización: ${data.message || 'No autorizado.'}`);
        case FORBIDDEN:
            throw new Error(`Acceso prohibido: ${data.message || 'No tienes permiso para acceder a este recurso.'}`);
        case NOT_FOUND:
            throw new Error(`Recurso no encontrado: ${data.message || 'El recurso solicitado no existe.'}`);
        case INTERNAL_SERVER_ERROR:
            throw new Error(`Error interno del servidor: ${data.message || 'Error en el servidor.'}`);
        default:
            // Si el código de estado no está manejado, lanzar un mensaje genérico
            throw new Error('Error desconocido. Por favor, inténtalo de nuevo más tarde.');
    }
};
