// Flags de comportamiento que se cambian a mano en código

/**
 * Evidencia fotográfica (tab "Fotos" de la OT).
 *
 * true  -> obligatoria: el tab exige al menos una foto de recepción y una de entrega para
 *          guardar, y la firma del ticket se bloquea mientras alguna OT activa no tenga el
 *          tab de Fotos completado.
 * false -> opcional: el tab se puede guardar sin fotos (o ni siquiera visitarse) y NO
 *          bloquea la firma ni el cierre de la OT/ticket. Pensado para tickets históricos
 *          a los que ya no se les pueden subir fotos.
 *
 * El backend (POST /work-orders/{id}/photos) ya acepta cero fotos, así que no requiere
 * ningún cambio al alternar este valor.
 */
export const REQUIRE_WORK_ORDER_PHOTOS = false;
