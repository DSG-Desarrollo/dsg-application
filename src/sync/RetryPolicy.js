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

export default { getRetryDelayMs, getNextRetryAt };
