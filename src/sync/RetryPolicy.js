// RetryPolicy.js
// Exponential backoff con límite máximo para operaciones fallidas (SPEC.md, sección 17).
// attempts = número de intentos ya realizados (0 antes del primer intento).
const DELAYS_MS = [0, 5000, 15000, 30000, 60000]; // inmediato, 5s, 15s, 30s, 60s
const MAX_DELAY_MS = 5 * 60 * 1000; // 5 minutos

export const getRetryDelayMs = (attempts) => {
    if (attempts <= 0) {
        return DELAYS_MS[0];
    }
    if (attempts < DELAYS_MS.length) {
        return DELAYS_MS[attempts];
    }
    return MAX_DELAY_MS;
};

export const getNextRetryAt = (attempts, now = new Date()) => {
    return new Date(now.getTime() + getRetryDelayMs(attempts)).toISOString();
};

/**
 * Clasifica un status HTTP para decidir si una operación fallida debe reintentarse
 * automáticamente (SPEC.md §18/§46 caso 7): errores de conectividad o del servidor
 * (5xx, o directamente sin respuesta) son transitorios y se reintentan con backoff;
 * un 4xx (validación, recurso no encontrado) es un rechazo definitivo del servidor —
 * la misma request nunca va a tener éxito sin cambiar los datos, así que NO debe
 * reintentarse sola indefinidamente.
 * @param {number|undefined|null} status
 * @returns {'success'|'transient'|'permanent'}
 */
export const classifyHttpStatus = (status) => {
    if (typeof status !== 'number') {
        // Sin status utilizable (excepción de red/parseo antes de recibir respuesta):
        // tratar como transitorio, no como rechazo definitivo del servidor.
        return 'transient';
    }
    if (status >= 200 && status < 300) {
        return 'success';
    }
    if (status >= 400 && status < 500) {
        return 'permanent';
    }
    return 'transient'; // 5xx u otros
};

export default { getRetryDelayMs, getNextRetryAt, classifyHttpStatus };
