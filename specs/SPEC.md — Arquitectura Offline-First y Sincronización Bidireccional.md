# SPEC.md — Arquitectura Offline-First y Sincronización Bidireccional

## 1. Objetivo

Implementar una arquitectura **Offline-First** para una aplicación móvil desarrollada con **React Native + Expo**, capaz de continuar funcionando sin conexión a Internet y sincronizar automáticamente los cambios entre el dispositivo móvil y el servidor cuando exista conectividad.

La aplicación deberá permitir:

- Consultar datos previamente sincronizados sin conexión.
- Crear nuevos registros sin conexión.
- Modificar registros sin conexión.
- Eliminar registros sin conexión.
- Mantener una cola local de operaciones pendientes.
- Detectar automáticamente cuándo existe conectividad.
- Sincronizar automáticamente los cambios locales con el servidor.
- Descargar cambios realizados en el servidor mientras el dispositivo estaba offline.
- Detectar diferencias entre la información local y la información del servidor.
- Detectar conflictos cuando un mismo registro haya sido modificado en ambos lados.
- Resolver conflictos mediante reglas explícitas.
- Reintentar automáticamente operaciones fallidas.
- Evitar duplicación de operaciones mediante mecanismos de idempotencia.
- Mantener consistencia entre la base de datos local y la base de datos del servidor.
- Permitir sincronización al iniciar la aplicación.
- Permitir sincronización mientras la aplicación permanece abierta.
- Permitir sincronización mediante tareas en segundo plano cuando el sistema operativo lo permita.

La arquitectura deberá ser **Local-First**, donde la base de datos SQLite del dispositivo sea la fuente inmediata de lectura y escritura para la aplicación.

---

# 2. Principio fundamental

La aplicación no deberá depender directamente de la disponibilidad de la API para funcionar.

El flujo principal será:

```text
Usuario
   │
   ▼
React Native
   │
   ▼
Repository
   │
   ▼
SQLite Local
   │
   ├── Datos locales
   │
   └── Sync Queue
             │
             ▼
        Sync Manager
             │
             ▼
        REST API
             │
             ▼
       Base de Datos
           Servidor
```

La aplicación deberá considerar dos procesos independientes:

```text
1. Operación local
2. Sincronización remota
```

Una operación local exitosa no deberá depender de que la API esté disponible.

---

# 3. Tecnologías

## 3.1 Mobile

- React Native
- Expo
- Expo Router
- JavaScript
- `expo-sqlite`
- `@react-native-community/netinfo`
- `expo-secure-store`
- `expo-file-system`
- `expo-background-task`

## 3.2 Backend

La API deberá exponer endpoints REST capaces de:

- Crear registros.
- Actualizar registros.
- Eliminar registros.
- Obtener cambios posteriores a una determinada versión o cursor.
- Confirmar operaciones.
- Detectar conflictos.
- Procesar operaciones idempotentemente.

La arquitectura del backend deberá mantenerse independiente de la tecnología utilizada para implementar la API.

---

# 4. Arquitectura de capas

La aplicación deberá separar claramente las siguientes responsabilidades:

```text
src/
│
├── api/
│   ├── client.js
│   ├── auth.js
│   ├── sync.js
│   └── ...
│
├── database/
│   ├── database.js
│   ├── migrations/
│   ├── repositories/
│   │   ├── OrderRepository.js
│   │   ├── ClientRepository.js
│   │   └── SyncRepository.js
│   └── models/
│
├── sync/
│   ├── SyncManager.js
│   ├── SyncQueue.js
│   ├── SyncService.js
│   ├── ConflictResolver.js
│   ├── RetryPolicy.js
│   └── SyncState.js
│
├── network/
│   └── NetworkMonitor.js
│
├── services/
│
├── hooks/
│
└── screens/
```

Los componentes visuales no deberán realizar directamente operaciones contra SQLite ni contra la API.

Ejemplo:

```javascript
await OrderRepository.create(order);
```

y no:

```javascript
await fetch('/api/orders');
```

desde una pantalla.

---

# 5. Base de datos local

La aplicación deberá utilizar SQLite como almacenamiento persistente local.

SQLite deberá almacenar:

- Datos de negocio.
- Estado de sincronización.
- Versiones de registros.
- Identificadores locales.
- Identificadores del servidor.
- Operaciones pendientes.
- Información necesaria para resolver conflictos.
- Información necesaria para detectar eliminaciones.

---

# 6. Identificación de registros

Cada entidad deberá manejar como mínimo:

```text
local_id
server_id
```

`local_id` será generado localmente.

`server_id` será asignado por el servidor cuando el registro haya sido sincronizado.

Esto permitirá crear registros offline sin esperar una respuesta del servidor.

Ejemplo:

```text
local_id: 550e8400-e29b-41d4-a716-446655440000
server_id: NULL
```

Después de sincronizar:

```text
local_id: 550e8400-e29b-41d4-a716-446655440000
server_id: 18452
```

Se recomienda utilizar UUID para `local_id`.

---

# 7. Metadatos de sincronización

Las entidades que puedan sincronizarse deberán manejar metadatos similares a:

```text
local_id
server_id
sync_status
server_version
local_version
created_at
updated_at
deleted_at
last_synced_at
```

Estados mínimos:

```text
synced
pending
syncing
failed
conflict
```

Ejemplo:

```text
orders

local_id        UUID
server_id       BIGINT NULL
status          VARCHAR
server_version  BIGINT
local_version   BIGINT
sync_status     VARCHAR
created_at      DATETIME
updated_at      DATETIME
deleted_at      DATETIME NULL
last_synced_at  DATETIME NULL
```

---

# 8. Sync Queue

Todas las operaciones que deban llegar al servidor deberán registrarse en una cola local.

Tabla conceptual:

```text
sync_queue
-----------------------------------------
id
operation_id
entity
entity_id
server_id
action
payload
status
attempts
last_error
next_retry_at
created_at
updated_at
```

Ejemplo:

```text
operation_id: 8a2...
entity: orders
entity_id: UUID
server_id: 10025
action: update
status: pending
attempts: 0
```

---

# 9. Idempotencia

Todas las operaciones enviadas al servidor deberán tener un `operation_id` único.

Ejemplo:

```text
operation_id:
01K2ABCXYZ...
```

El servidor deberá almacenar las operaciones procesadas.

Si el dispositivo envía:

```text
operation_id = ABC123
```

y posteriormente vuelve a enviar:

```text
operation_id = ABC123
```

el servidor deberá reconocer que la operación ya fue procesada.

Esto evita duplicaciones cuando ocurre:

```text
Mobile
   │
   ├── request ───────► Server
   │
   │       Server procesa
   │
   │       respuesta perdida
   │
   X
   │
   └── retry ──────────► Server
```

Sin idempotencia podría crearse el mismo registro dos veces.

Con idempotencia:

```text
ABC123 → procesada
ABC123 → ya procesada → devolver resultado anterior
```

---

# 10. Sincronización bidireccional

La sincronización deberá funcionar en ambas direcciones.

```text
             ┌──────────────┐
             │    SERVER    │
             └──────┬───────┘
                    ▲
                    │
             cambios remotos
                    │
                    │
                    ▼
             ┌──────────────┐
             │    MOBILE    │
             └──────────────┘
                    │
                    │
                    ▼
             cambios locales
                    │
                    │
                    ▼
             ┌──────────────┐
             │    SERVER    │
             └──────────────┘
```

La sincronización no deberá limitarse a:

```text
Mobile → Server
```

También deberá soportar:

```text
Server → Mobile
```

---

# 11. Detección de cambios del servidor

La API deberá proporcionar un mecanismo incremental para obtener únicamente los cambios posteriores al último punto sincronizado.

Se recomienda utilizar un:

```text
cursor
```

o:

```text
server_sequence
```

Ejemplo:

```text
GET /api/sync/changes?cursor=1500
```

Respuesta conceptual:

```json
{
    "data": [
        {
            "entity": "orders",
            "id": 10025,
            "action": "update",
            "version": 1501
        },
        {
            "entity": "clients",
            "id": 501,
            "action": "update",
            "version": 1502
        }
    ],
    "next_cursor": 1502
}
```

El dispositivo almacenará:

```text
last_server_cursor = 1502
```

En la siguiente sincronización solicitará:

```text
GET /api/sync/changes?cursor=1502
```

De esta manera no será necesario descargar nuevamente toda la base de datos.

---

# 12. Registro global de cambios

El servidor deberá mantener un mecanismo para conocer qué registros han cambiado.

Conceptualmente:

```text
sync_changes
-----------------------------------------
id
entity
entity_id
action
version
created_at
```

Ejemplo:

```text
id     entity      entity_id    action     version
---------------------------------------------------
1501   orders      10025        update     1501
1502   clients     501          update     1502
1503   orders      10026        delete     1503
```

Este mecanismo permitirá realizar sincronización incremental.

---

# 13. Eliminaciones

Las eliminaciones no deberán desaparecer inmediatamente de la base de datos local ni necesariamente del mecanismo de sincronización.

Se deberán utilizar **tombstones** o marcas de eliminación.

Ejemplo:

```text
deleted_at = 2026-08-14 10:30:00
```

En lugar de:

```sql
DELETE FROM orders WHERE id = 10025;
```

el registro puede permanecer temporalmente:

```text
id = 10025
deleted_at = ...
```

Esto permite informar al móvil que el registro fue eliminado.

Una vez que todos los dispositivos relevantes hayan podido procesar el cambio y después de cumplir la política de retención, los tombstones podrán ser purgados.

---

# 14. Flujo de sincronización

El `SyncManager` deberá ejecutar conceptualmente:

```text
1. Verificar conectividad
2. Autenticar sesión
3. Enviar cambios locales
4. Procesar respuestas
5. Resolver conflictos
6. Obtener cambios del servidor
7. Aplicar cambios locales
8. Actualizar cursor
9. Finalizar sincronización
```

Flujo:

```text
             START
               │
               ▼
       ¿Existe conexión?
          │           │
         NO           YES
          │            │
          ▼            ▼
       WAIT       Authenticate
                       │
                       ▼
                Push local changes
                       │
                       ▼
                Process responses
                       │
             ┌─────────┴─────────┐
             │                   │
          Conflict             OK
             │                   │
             ▼                   │
      Resolve conflict           │
             │                   │
             └─────────┬─────────┘
                       ▼
                Pull server changes
                       │
                       ▼
                 Apply changes
                       │
                       ▼
                 Update cursor
                       │
                       ▼
                      END
```

---

# 15. Orden recomendado de sincronización

La sincronización deberá priorizar:

```text
1. Crear registros
2. Actualizar registros
3. Eliminar registros
4. Descargar cambios remotos
```

Sin embargo, el orden podrá modificarse según las dependencias entre entidades.

Por ejemplo:

```text
Cliente
   ↓
Orden
   ↓
Detalle de orden
```

No deberá sincronizarse un detalle que dependa de una orden que todavía no existe en el servidor.

---

# 16. Estados de una operación

Una operación deberá evolucionar de la siguiente forma:

```text
pending
   │
   ▼
syncing
   │
   ├──────────────► synced
   │
   ├──────────────► failed
   │
   └──────────────► conflict
```

Una operación `failed` deberá poder reintentarse.

Una operación `conflict` no deberá reintentarse indefinidamente de manera automática.

---

# 17. Retry y Backoff

Los errores temporales deberán utilizar reintentos automáticos.

Ejemplo conceptual:

```text
Intento 1 → inmediato
Intento 2 → 5 segundos
Intento 3 → 15 segundos
Intento 4 → 30 segundos
Intento 5 → 60 segundos
Intento 6 → 5 minutos
```

Se deberá utilizar exponential backoff con un límite máximo.

No deberán realizarse reintentos infinitos e inmediatos.

---

# 18. Tipos de errores

Los errores deberán clasificarse.

## Error de conectividad

Ejemplo:

```text
Network timeout
Connection refused
DNS failure
```

Acción:

```text
retry
```

## Error temporal del servidor

```text
HTTP 500
HTTP 502
HTTP 503
HTTP 504
```

Acción:

```text
retry
```

## Error de autenticación

```text
HTTP 401
```

Acción:

```text
refresh token
```

Si no es posible renovar la sesión:

```text
pause synchronization
```

## Error de validación

```text
HTTP 422
```

Acción:

```text
failed
```

No deberá reintentarse automáticamente sin modificar los datos.

## Conflicto

```text
HTTP 409
```

Acción:

```text
conflict
```

Deberá pasar al `ConflictResolver`.

---

# 19. Control de versiones

Cada registro sincronizable deberá tener una versión del servidor.

Ejemplo:

```text
server_version = 7
```

El dispositivo tiene:

```text
version = 7
```

El servidor recibe una actualización:

```text
expected_version = 7
```

Si el servidor todavía está en:

```text
version = 7
```

puede aplicar:

```text
UPDATE
```

y generar:

```text
version = 8
```

Pero si el servidor ya está en:

```text
version = 8
```

significa que alguien modificó el registro.

Debe producirse:

```text
409 Conflict
```

---

# 20. Detección de conflictos

Ejemplo:

```text
Servidor
---------
OT 10025
status = pending
version = 7
```

El dispositivo descarga:

```text
version = 7
```

Mientras está offline:

```text
Mobile
---------
status = completed
```

Otro usuario modifica el servidor:

```text
Server
---------
status = cancelled
version = 8
```

El móvil intenta:

```text
status = completed
expected_version = 7
```

El servidor detecta:

```text
client_version = 7
server_version = 8
```

Resultado:

```text
409 Conflict
```

---

# 21. Estrategia de resolución de conflictos

La primera implementación deberá utilizar reglas explícitas por entidad.

No se deberá implementar una estrategia genérica que asuma que todos los datos pueden resolverse de la misma manera.

Ejemplo:

```text
orders
→ conflicto requiere revisión

catalogs
→ server wins

user preferences
→ client wins

logs
→ append-only
```

Cada entidad podrá definir su estrategia.

---

# 22. Estrategias soportadas

Se deberán contemplar inicialmente:

```text
SERVER_WINS
CLIENT_WINS
MANUAL
MERGE
APPEND_ONLY
```

### SERVER_WINS

El servidor tiene prioridad.

```text
Server → Mobile
```

### CLIENT_WINS

El cambio local reemplaza el remoto cuando las reglas del negocio lo permitan.

### MANUAL

La aplicación informa que existe un conflicto y solicita una decisión.

### MERGE

Los cambios pueden combinarse campo por campo.

### APPEND_ONLY

Los registros no se modifican; solamente se agregan nuevos eventos.

---

# 23. No utilizar únicamente "last write wins"

No se deberá utilizar:

```text
updated_at más reciente gana
```

como mecanismo universal de resolución.

Aunque puede ser válido para algunos datos simples, puede provocar pérdida silenciosa de información.

Ejemplo:

```text
Mobile:
address = A
phone = 123

Server:
address = B
phone = 456
```

Un simple `last_write_wins` podría eliminar cambios válidos realizados en el otro lado.

Cuando sea necesario, se deberá evaluar sincronización por campos:

```text
address
phone
email
status
```

---

# 24. Atomicidad

La aplicación deberá utilizar transacciones SQLite cuando procese una sincronización.

Por ejemplo:

```text
BEGIN TRANSACTION

actualizar registro
actualizar sync_queue
actualizar cursor

COMMIT
```

Si ocurre un error:

```text
ROLLBACK
```

Nunca deberá quedar:

```text
registro actualizado
cursor actualizado incorrectamente
```

---

# 25. Cursor de sincronización

El cursor del servidor deberá actualizarse únicamente después de aplicar correctamente los cambios recibidos.

Incorrecto:

```text
recibir cambios
↓
guardar cursor
↓
procesar cambios
```

Correcto:

```text
recibir cambios
↓
procesar cambios
↓
transaction commit
↓
guardar cursor
```

De esta forma, si la aplicación se cierra durante la sincronización, podrá volver a procesar los cambios.

---

# 26. Sincronización al iniciar

Al iniciar la aplicación:

```text
App Start
   ↓
Initialize SQLite
   ↓
Load local data
   ↓
Check authentication
   ↓
Check network
   ↓
Start SyncManager
```

La interfaz no deberá bloquearse esperando la sincronización.

El usuario deberá poder utilizar los datos locales mientras el proceso ocurre.

---

# 27. Sincronización por cambio de conectividad

El `NetworkMonitor` deberá escuchar cambios en la conectividad.

Ejemplo:

```text
Offline
   ↓
WiFi connected
   ↓
SyncManager.start()
```

Sin embargo, `isConnected` no deberá considerarse garantía absoluta de acceso al servidor.

El `SyncManager` deberá validar mediante una solicitud real a la API.

---

# 28. Sincronización manual

La aplicación deberá permitir al usuario iniciar una sincronización manual.

Ejemplo:

```text
Sincronizar ahora
```

Durante el proceso podrá mostrarse:

```text
Sincronizando...

12 de 25 operaciones
```

Al finalizar:

```text
✓ Sincronización completada
```

Si existen errores:

```text
⚠ Sincronización completada con 2 errores
```

---

# 29. Estado global de sincronización

La aplicación deberá conocer el estado actual:

```text
idle
syncing
success
error
offline
conflict
```

Esto permitirá mostrar información como:

```text
✓ Sincronizado
```

o:

```text
↻ Sincronizando...
```

o:

```text
⚠ 3 cambios pendientes
```

o:

```text
☁ Sin conexión
```

---

# 30. Contador de operaciones pendientes

La aplicación deberá poder consultar:

```text
pending_count
failed_count
conflict_count
```

Ejemplo:

```text
Sincronización

Pendientes: 5
Fallidas: 1
Conflictos: 0
```

---

# 31. Persistencia durante cierre inesperado

La cola de sincronización deberá persistir en SQLite.

Si ocurre:

```text
Usuario crea registro
↓
Registro guardado localmente
↓
App se cierra
```

al volver a abrir:

```text
SQLite
↓
sync_queue
↓
registro pending
```

La operación deberá continuar siendo procesable.

---

# 32. Archivos e imágenes

Las fotografías y archivos deberán tratarse de manera diferente a los datos pequeños.

El flujo recomendado será:

```text
Captura fotografía
      ↓
Guardar archivo local
      ↓
Guardar metadata SQLite
      ↓
sync_status = pending
      ↓
Internet
      ↓
Upload
      ↓
Servidor/S3
      ↓
Guardar URL/remoto
      ↓
synced
```

La fotografía no deberá depender de que exista Internet en el momento de capturarla.

---

# 33. Seguridad

Los tokens de autenticación deberán almacenarse utilizando almacenamiento seguro.

No deberán almacenarse:

```text
access tokens
refresh tokens
credenciales
```

en texto plano dentro de SQLite o AsyncStorage.

Los datos sensibles deberán evaluarse individualmente para determinar si deben almacenarse localmente.

---

# 34. Datos que no necesitan SQLite

No todo deberá persistirse en SQLite.

Ejemplos de información temporal:

```text
isLoading
modalVisible
currentTab
formOpen
```

deberán permanecer en memoria.

SQLite deberá utilizarse para información que necesita persistencia o sincronización.

---

# 35. API de sincronización

La API deberá contemplar endpoints especializados.

Conceptualmente:

```text
POST /api/sync/push
GET  /api/sync/changes
```

### Push

```text
POST /api/sync/push
```

Payload:

```json
{
    "operations": [
        {
            "operation_id": "uuid",
            "entity": "orders",
            "action": "update",
            "server_id": 10025,
            "expected_version": 7,
            "payload": {
                "status": "completed"
            }
        }
    ]
}
```

### Pull

```text
GET /api/sync/changes?cursor=1500
```

Respuesta:

```json
{
    "changes": [],
    "next_cursor": 1505
}
```

---

# 36. Respuesta de Push

El servidor deberá devolver el resultado individual de cada operación.

Ejemplo:

```json
{
    "results": [
        {
            "operation_id": "ABC",
            "status": "synced",
            "server_id": 10025,
            "server_version": 8
        },
        {
            "operation_id": "DEF",
            "status": "conflict",
            "server_id": 10026,
            "server_version": 12
        }
    ]
}
```

No se deberá asumir que todas las operaciones de un batch tienen el mismo resultado.

---

# 37. Creación offline

Cuando se cree una entidad offline:

```text
local_id = UUID
server_id = NULL
sync_status = pending
```

Ejemplo:

```text
Cliente
local_id = ABC
server_id = NULL
```

Cuando el servidor la procese:

```text
local_id = ABC
server_id = 5001
sync_status = synced
```

El `local_id` deberá mantenerse para poder relacionar correctamente las referencias locales.

---

# 38. Dependencias entre entidades

La sincronización deberá soportar dependencias.

Ejemplo:

```text
Cliente
   ↓
Orden
   ↓
Detalle
```

Si se crea todo offline:

```text
Cliente local_id = A
Orden local_id = B
Detalle local_id = C
```

el servidor deberá poder resolver:

```text
A → server_id 100
B → server_id 200
C → server_id 300
```

La aplicación deberá mantener un mapa de identificadores locales y remotos.

---

# 39. Consistencia

La sincronización deberá ser:

- Persistente.
- Reintentable.
- Idempotente.
- Incremental.
- Transaccional.
- Tolerante a interrupciones.
- Consciente de conflictos.

No se deberá intentar garantizar que móvil y servidor tengan exactamente el mismo estado en todo momento.

El objetivo es lograr:

```text
eventually consistent
```

cuando exista conectividad y las operaciones puedan resolverse.

---

# 40. Eventual Consistency

Mientras el dispositivo está offline:

```text
Mobile ≠ Server
```

Esto es esperado.

Después de sincronizar correctamente:

```text
Mobile ≈ Server
```

Si no existen conflictos pendientes:

```text
Mobile = Server
```

La arquitectura deberá considerar la consistencia eventual como una característica fundamental del sistema.

---

# 41. Estado de sincronización de la aplicación

La aplicación deberá poder determinar:

```text
ONLINE
OFFLINE
SYNCING
SYNCED
PENDING
ERROR
CONFLICT
```

Ejemplo:

```text
ONLINE
5 operaciones pendientes
```

Esto significa:

```text
Internet disponible
pero todavía existen cambios locales sin enviar
```

---

# 42. Prevención de sincronizaciones simultáneas

No deberá existir más de un proceso de sincronización ejecutándose simultáneamente.

Incorrecto:

```text
NetworkMonitor → Sync
AppStart       → Sync
Manual Button  → Sync
Background     → Sync
```

Todos ejecutándose al mismo tiempo.

Deberá existir un lock:

```text
SyncManager
    │
    ├── isSyncing = true
    │
    └── nuevas solicitudes → ignorar/encolar
```

---

# 43. Prioridad de sincronización

El sistema podrá utilizar prioridades:

```text
HIGH
NORMAL
LOW
```

Ejemplo:

```text
HIGH
→ información crítica de una orden

NORMAL
→ modificaciones normales

LOW
→ estadísticas o información secundaria
```

---

# 44. Observabilidad

El sistema deberá registrar información suficiente para diagnosticar problemas.

Ejemplo:

```text
operation_id
entity
action
attempt
error
duration
timestamp
```

No deberán registrarse datos sensibles innecesariamente.

---

# 45. Métricas recomendadas

El sistema podrá registrar:

```text
sync_started
sync_completed
sync_failed
operation_failed
conflict_detected
conflict_resolved
retry_started
```

Esto permitirá detectar problemas de sincronización en producción.

---

# 46. Casos de uso obligatorios

## Caso 1 — Crear offline

```text
Usuario crea registro
↓
SQLite
↓
pending
↓
App cerrada
↓
App abierta
↓
Internet
↓
sync
↓
server_id asignado
↓
synced
```

## Caso 2 — Modificar offline

```text
Registro existente
↓
Usuario modifica
↓
SQLite
↓
pending
↓
Internet
↓
API
↓
synced
```

## Caso 3 — Servidor modifica mientras móvil está offline

```text
Mobile offline
↓
Server cambia registro
↓
Mobile vuelve online
↓
Pull changes
↓
SQLite actualizado
```

## Caso 4 — Conflicto

```text
Mobile version 7
Server version 7

Mobile modifica
Server modifica

Mobile intenta push
↓
Server version = 8
↓
409 Conflict
↓
ConflictResolver
```

## Caso 5 — Internet intermitente

```text
Push
↓
timeout
↓
failed
↓
retry
↓
Internet vuelve
↓
retry
↓
success
```

## Caso 6 — Aplicación cerrada

```text
Pending operation
↓
App cerrada
↓
App vuelve a abrir
↓
Queue recuperada
↓
Sync
```

## Caso 7 — Error permanente

```text
HTTP 422
↓
failed
↓
No retry automático infinito
↓
Mostrar error
```

---

# 47. Criterios de aceptación

La implementación se considerará correcta cuando:

- [ ] La aplicación pueda crear registros sin Internet.
- [ ] Los registros offline sobrevivan al cierre de la aplicación.
- [ ] Los cambios locales sean almacenados en SQLite.
- [ ] Las operaciones pendientes sean persistentes.
- [ ] La aplicación detecte cambios de conectividad.
- [ ] La aplicación sincronice automáticamente al recuperar conexión.
- [ ] La aplicación sincronice al iniciar.
- [ ] La aplicación pueda sincronizar manualmente.
- [ ] Los cambios del servidor puedan descargarse al dispositivo.
- [ ] La sincronización sea incremental.
- [ ] Exista un cursor de sincronización.
- [ ] Las eliminaciones sean sincronizables.
- [ ] Existan tombstones para eliminaciones cuando sea necesario.
- [ ] Cada operación tenga un `operation_id`.
- [ ] El backend implemente idempotencia.
- [ ] Exista control de versiones.
- [ ] El backend pueda detectar conflictos.
- [ ] Los conflictos generen una respuesta diferenciada.
- [ ] Exista un `ConflictResolver`.
- [ ] Los conflictos no entren en un retry infinito.
- [ ] Exista exponential backoff.
- [ ] Los errores temporales sean reintentables.
- [ ] Los errores permanentes no sean reintentados indefinidamente.
- [ ] Las operaciones SQLite críticas sean transaccionales.
- [ ] No puedan ejecutarse dos sincronizaciones simultáneamente.
- [ ] Las dependencias entre entidades puedan resolverse.
- [ ] Los archivos puedan almacenarse localmente antes de subirlos.
- [ ] La aplicación pueda funcionar normalmente sin conexión.
- [ ] El usuario pueda conocer el estado de sincronización.
- [ ] El sistema pueda recuperar una sincronización interrumpida.
- [ ] La sincronización bidireccional sea eventualmente consistente.

---

# 48. Arquitectura final esperada

```text
                         ┌────────────────────────┐
                         │      React Native      │
                         │          Expo          │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │       Repository       │
                         └───────────┬────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
             ┌───────────────┐               ┌────────────────┐
             │    SQLite     │               │  Local Files   │
             │               │               │                │
             │ Business Data │               │ Photos/Files   │
             │ Sync Metadata │               │                │
             │ Sync Queue    │               │                │
             └───────┬───────┘               └───────┬────────┘
                     │                               │
                     └──────────────┬────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │   SyncManager   │
                           └────────┬────────┘
                                    │
                   ┌────────────────┼─────────────────┐
                   │                │                 │
                   ▼                ▼                 ▼
              NetworkMonitor   RetryPolicy    ConflictResolver
                   │                │                 │
                   └────────────────┼─────────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │    REST API     │
                           │                 │
                           │ Push            │
                           │ Pull            │
                           │ Idempotency     │
                           │ Versions        │
                           │ Conflicts       │
                           └────────┬────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │ Server Database │
                           │                 │
                           │ Business Data   │
                           │ Versions        │
                           │ Change Log      │
                           │ Operations      │
                           └─────────────────┘
```

---

# 49. Principio arquitectónico final

La aplicación deberá diseñarse bajo la siguiente premisa:

> **La conexión a Internet es una capacidad adicional de la aplicación, no un requisito para utilizarla.**

La aplicación deberá poder trabajar de manera normal en:

```text
ONLINE
OFFLINE
ONLINE → OFFLINE
OFFLINE → ONLINE
```

La sincronización deberá ser un proceso independiente de la interfaz y deberá encargarse de convertir eventualmente:

```text
Cambios locales
       +
Cambios remotos
       +
Resolución de conflictos
       ↓
Estado consistente
```

El objetivo final no es simplemente "guardar datos cuando no hay Internet", sino implementar un verdadero **sistema de sincronización bidireccional, persistente, incremental, idempotente y tolerante a fallos**.