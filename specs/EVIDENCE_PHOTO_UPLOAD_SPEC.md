# Spec: Subida de Fotografías de Evidencia (Revisión de Orden de Trabajo)

## Propósito

Cuando un técnico revisa una Orden de Trabajo (OT) antes de completarla, debe dejar evidencia
fotográfica del estado del equipo/unidad en dos momentos: **ANTES** (recepción) y **DESPUÉS**
(entrega). Estas fotos se suben a un almacenamiento de objetos (tipo S3) y quedan asociadas a la
orden de trabajo para: (a) mostrarse durante la revisión, (b) exigirse como requisito antes de poder
marcar la orden como revisada/completada, y (c) reutilizarse más adelante para construir el
documento de evidencias que se adjunta al correo de cierre del ticket.

Este documento describe el flujo de negocio de punta a punta, independiente de lenguaje, framework o
proveedor de almacenamiento concretos.

## Conceptos y relación de datos

- Una **foto de evidencia** pertenece a una **orden de trabajo**; una orden de trabajo pertenece a un
  **ticket**; un ticket pertenece a un **cliente**. Toda operación de lectura/escritura de fotos
  requiere los tres identificadores (cliente, ticket, orden) — excepto la eliminación, que se
  identifica solo por el id propio del registro de la foto.
- Cada foto tiene un **tipo**: `ANTES` o `DESPUES`. Ambos tipos se gestionan como grupos
  independientes en todo el flujo (galerías separadas, límites separados, conteos separados).
- Cada foto queda representada por un **registro** en la base de datos con, como mínimo:
  - identificador único del registro,
  - tipo (`ANTES` / `DESPUES`),
  - nombre/clave único del objeto almacenado,
  - metadatos de integridad del objeto subido (referencia de versión, identificador de recurso,
    URI de almacenamiento, URL de acceso devuelta al subir),
  - una marca de "activa" / "eliminada" (borrado lógico, no físico).

## 1. Selección y subida (acción del usuario)

- La interfaz presenta **dos zonas de carga independientes**: una para fotos "ANTES" y otra para
  fotos "DESPUÉS".
- Cada zona acepta como máximo **4 archivos**, y solo imágenes (formatos comunes tipo JPEG/PNG); esta
  restricción se aplica en el cliente antes de intentar subir.
- El usuario dispara la subida indicando: identificador de cliente, identificador de ticket,
  identificador de orden de trabajo, y los archivos de cada grupo (pueden enviarse ambos grupos en la
  misma acción o por separado).
- **La operación de subida no es idempotente**: repetir la misma llamada vuelve a subir y a registrar
  los archivos como nuevos, generando duplicados. La interfaz no debe reintentar automáticamente una
  subida ya en curso o ya confirmada.

## 2. Procesamiento en el backend por archivo

Para cada archivo recibido, dentro de su grupo (ANTES/DESPUES):

1. Se construye un **nombre de objeto único** a partir de: identificador de la orden, tipo (en
   minúscula), marca de tiempo (fecha y hora de subida), el campo de origen del archivo, un índice
   dentro del lote, un sufijo aleatorio/único, y la extensión original del archivo (si no puede
   determinarse, se usa una extensión por defecto).
2. El objeto se sube al almacenamiento en una **estructura plana**: no hay subcarpetas por cliente ni
   por ticket ni por orden — toda la trazabilidad (a qué orden, tipo, momento y archivo de origen
   pertenece) vive codificada en el propio nombre del objeto, no en la ruta.
3. **El fallo de un archivo individual no aborta el lote**: los archivos que fallan se acumulan en una
   lista de errores; los que sí se suben correctamente continúan al siguiente paso.
4. Al terminar de subir todos los archivos de un grupo, se registran en la base de datos **en una sola
   operación por grupo** (todas las fotos exitosas del grupo se insertan juntas).
5. **Riesgo conocido**: si la subida al almacenamiento tiene éxito pero el registro en base de datos
   falla, el objeto queda huérfano en el almacenamiento (no hay una operación de "deshacer" la subida
   cuando falla el registro). Esto debe tenerse en cuenta al portar la feature: idealmente el nuevo
   diseño debería revertir la subida o marcarla para limpieza si el registro falla.

La respuesta de la subida reporta, por cada grupo (ANTES y DESPUES) por separado: cuántos archivos se
subieron, cuáles fallaron (y por qué), si el registro en base de datos tuvo éxito, y el detalle del
error si no lo tuvo.

## 3. Consulta/listado de fotos de una orden

- Se solicita pasando cliente, ticket y orden.
- Se devuelven únicamente las fotos **activas** (no eliminadas) de esa orden específica, agrupadas por
  tipo (ANTES / DESPUES).
- No hay paginación ni variante de miniatura: el mismo objeto sirve tanto para listado como para vista
  completa.
- La URL devuelta apunta al objeto real en el almacenamiento, pero **el almacenamiento es privado**
  (sin acceso público directo) — esa URL no es utilizable tal cual desde el navegador; existe un paso
  intermedio (ver punto 4) para servir la imagen.

## 4. Visualización de una foto individual (proxy de lectura)

- Como el almacenamiento no permite acceso público directo, mostrar una foto en pantalla pasa siempre
  por un intermediario del backend: el cliente pide "mostrar el archivo X" (identificando el objeto
  solo por su nombre base, nunca por una ruta completa, para evitar acceder a otros archivos fuera de
  lo esperado), el backend recupera el objeto desde el almacenamiento y lo retransmite al navegador con
  el tipo de contenido original.
- Este paso requiere que el usuario tenga una sesión activa; si no, se rechaza.

## 5. Eliminación de una foto

- Se identifica **solo por el id del registro** (no requiere cliente/ticket/orden).
- Es un **borrado lógico**: se marca el registro como eliminado en la base de datos; el objeto en el
  almacenamiento **no se borra ni se toca**. La limpieza física, si se necesita, queda fuera de este
  flujo.
- No hay validación de propiedad/rol específica más allá de tener sesión iniciada en el sistema — es
  decir, cualquier usuario autenticado con acceso a esa pantalla puede eliminar cualquier foto
  identificando su id.

## 6. Regla de negocio: requisito para marcar la orden como revisada

- Antes de permitir que una orden de trabajo se marque como revisada/completada, se valida (pasando
  cliente, ticket y orden) si **existe al menos una foto activa** asociada a esa orden.
- La regla, tal como está implementada hoy, es una existencia genérica: **no exige explícitamente que
  haya al menos una foto de cada tipo** (ANTES y DESPUES) — solo que haya alguna. Si al portar la
  feature se quiere una regla más estricta (por tipo), es una decisión de negocio a confirmar, no algo
  que el comportamiento actual ya garantice.
- Si la validación falla, la interfaz bloquea la acción de completar la orden y resalta visualmente la
  sección de fotos pendiente.

## 7. Consumo posterior (fuera del alcance de la subida, solo para contexto)

Cuando el ticket completo se cierra, un proceso aparte vuelve a listar todas las fotos activas de
**todas** las órdenes del ticket, las agrupa por tipo y por orden, descarga temporalmente cada objeto
para insertarlo en un documento de evidencias, y borra las copias temporales locales al terminar. Este
proceso **no modifica ni elimina** los objetos originales en el almacenamiento.

## Resumen de reglas y riesgos a preservar al portar la feature

| Regla / comportamiento | Detalle |
|---|---|
| Máximo de fotos por tipo | 4 (validado en cliente y en el backend) |
| Tipos válidos | `ANTES`, `DESPUES` — grupos siempre independientes |
| Idempotencia de la subida | No es idempotente; reintentar duplica |
| Tolerancia a fallos parciales | Un archivo fallido no bloquea al resto del lote |
| Consistencia subida↔registro | Agregar rollback si falla el registro tras subir (para evitar riesgo de huérfanos) |
| Estructura de nombres de objeto | Plana; toda la trazabilidad va en el nombre, no en carpetas |
| Borrado | Lógico únicamente; el objeto almacenado permanece |
| Acceso de lectura | Siempre por proxy autenticado, nunca URL directa (almacenamiento privado) |
| Requisito para "revisada" | Al menos 2 fotos activas 1 para cada `ANTES`, `DESPUES` |
| Validación de tipo/tamaño de archivo | Validar en el cliente y en el backend |
