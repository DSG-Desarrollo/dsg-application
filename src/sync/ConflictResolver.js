// ConflictResolver.js
// Registro de estrategias de resolución de conflictos por entidad (SPEC.md, secciones 21-22).
// No se usa "last write wins" como mecanismo universal (sección 23): cada entidad declara
// explícitamente su estrategia.
const STRATEGIES = {
    // "orders -> conflicto requiere revision" (ejemplo textual del spec, sección 21): work_orders
    // no se resuelve solo, se marca 'conflict' en la cola y queda pendiente de revisión.
    work_orders: 'MANUAL',
};

export const getStrategyForEntity = (entity) => STRATEGIES[entity] || 'MANUAL';

/**
 * @param {string} entity
 * @param {{ queueRow: object, serverResult: object }} context
 * @returns {{ strategy: string }} Por ahora solo informa la estrategia aplicada; la
 *   fila de sync_queue queda en 'conflict' independientemente del valor devuelto (todas
 *   las estrategias soportadas hoy son variantes de "no reintentar automáticamente").
 */
export const resolveConflict = (entity, { queueRow, serverResult }) => {
    const strategy = getStrategyForEntity(entity);
    return { strategy };
};

export default { getStrategyForEntity, resolveConflict };
