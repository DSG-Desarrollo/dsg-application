// utils/httpErrorHandler.js

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
        case 400:
            throw new Error(`Error de solicitud: ${data.message || 'Datos de solicitud inválidos.'}`);
        case 401:
            throw new Error(`Error de autorización: ${data.message || 'No autorizado.'}`);
        case 403:
            throw new Error(`Acceso prohibido: ${data.message || 'No tienes permiso para acceder a este recurso.'}`);
        case 404:
            throw new Error(`Recurso no encontrado: ${data.message || 'El recurso solicitado no existe.'}`);
        case 500:
            throw new Error(`Error interno del servidor: ${data.message || 'Error en el servidor.'}`);
        default:
            // Si el código de estado no está manejado, lanzar un mensaje genérico
            throw new Error('Error desconocido. Por favor, inténtalo de nuevo más tarde.');
    }
};
