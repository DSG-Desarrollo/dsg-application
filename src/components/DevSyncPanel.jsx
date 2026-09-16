// DevSyncPanel.jsx
// Panel de depuración TEMPORAL para probar manualmente el mecanismo de sincronización
// offline de WorkOrders desde el propio dispositivo: hoy ninguna pantalla real llama a
// WorkOrderRepository/SyncManager, así que sin esto no hay forma de disparar el flujo.
// Solo se monta en __DEV__ (ver su uso en NetworkInfo.jsx). Procedimiento completo en
// OFFLINE_TESTING.md, en la raíz de app/. Borrar este archivo (y su uso en NetworkInfo)
// cuando el flujo offline quede conectado a una pantalla real.
import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useDatabase } from '@context/DatabaseContext';
import { useSyncState } from '@context/SyncContext';
import WorkOrderRepository from '@repositories/WorkOrderRepository';
import SyncManager from '@sync/SyncManager';
import NetworkMonitor from '@network/NetworkMonitor';
import AxiosManager from '@utils/AxiosManager';

const { wsERPURL, DBNAME } = Constants.expoConfig.extra;

// Codificador base64 manual: no hay Buffer/btoa disponible en Hermes/RN sin polyfill,
// y acá se codifica el Uint8Array de serializeAsync() directo en memoria, sin pasar
// por un archivo (ver comentario en handleExportDb sobre por qué se evita FileSystem).
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const bytesToBase64 = (bytes) => {
    const chunks = [];
    let i;
    for (i = 0; i + 2 < bytes.length; i += 3) {
        chunks.push(
            BASE64_CHARS[bytes[i] >> 2],
            BASE64_CHARS[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)],
            BASE64_CHARS[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)],
            BASE64_CHARS[bytes[i + 2] & 63]
        );
    }
    const remaining = bytes.length - i;
    if (remaining === 1) {
        chunks.push(BASE64_CHARS[bytes[i] >> 2], BASE64_CHARS[(bytes[i] & 3) << 4], '==');
    } else if (remaining === 2) {
        chunks.push(
            BASE64_CHARS[bytes[i] >> 2],
            BASE64_CHARS[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)],
            BASE64_CHARS[(bytes[i + 1] & 15) << 2],
            '='
        );
    }
    return chunks.join('');
};

const DevSyncPanel = () => {
    const { executeSql, getFirstAsyncSql, getAllAsyncSql, serializeDatabase } = useDatabase();
    const workOrderRepository = WorkOrderRepository();
    const syncState = useSyncState();
    const [orderId, setOrderId] = useState('');
    const [version, setVersion] = useState('');
    const [log, setLog] = useState('Listo.');

    const appendLog = (line) => setLog((prev) => `${line}\n${prev}`.slice(0, 1500));

    const handleSeed = async () => {
        const id = Number(orderId);
        const ver = Number(version);
        if (!id || !ver) {
            appendLog('Completá id_orden_trabajo y version antes de sembrar.');
            return;
        }

        try {
            const existing = await getFirstAsyncSql('SELECT id FROM work_orders WHERE id_orden_trabajo = ?', [id]);
            if (existing) {
                await executeSql(
                    `UPDATE work_orders SET version = ?, sync_status = 'synced' WHERE id_orden_trabajo = ?`,
                    [ver, id]
                );
            } else {
                await executeSql(
                    `INSERT INTO work_orders (id_orden_trabajo, version, progreso_orden_trabajo, sync_status) VALUES (?, ?, 'O', 'synced')`,
                    [id, ver]
                );
            }
            appendLog(`Sembrada OT ${id} en version ${ver}.`);
        } catch (error) {
            appendLog(`Error al sembrar: ${error.message}`);
        }
    };

    const handleSimulateChange = async () => {
        const id = Number(orderId);
        if (!id) {
            appendLog('Completá id_orden_trabajo antes de simular un cambio.');
            return;
        }

        try {
            const { operationId } = await workOrderRepository.updateStatus(id, {
                comentario_orden: `Prueba offline ${new Date().toISOString()}`,
            });
            appendLog(`Encolado operation_id=${operationId}`);
        } catch (error) {
            appendLog(`Error al simular cambio: ${error.message}`);
        }
    };

    // El log en pantalla (appendLog) trunca a 1500 caracteres y el recuadro es chico —
    // para inspeccionar payloads/errores completos hay que mirar la terminal de Metro.
    // Por eso acá siempre espejamos con console.log/console.error (sin truncar) además
    // de actualizar el panel.
    const handleSyncNow = async () => {
        console.log(`[DevSyncPanel] NetworkMonitor.isConnected=${NetworkMonitor.getIsConnected()} -> syncNow()`);
        appendLog(`NetworkMonitor.isConnected=${NetworkMonitor.getIsConnected()} -> disparando syncNow()`);
        try {
            // Se llama a syncNow() directo (no requestSync(), que es fire-and-forget) para
            // poder esperarlo acá y mostrar la cola actualizada apenas termina.
            await SyncManager.syncNow();
            console.log('[DevSyncPanel] syncNow() terminó sin lanzar error.');
            appendLog('syncNow() terminó.');
        } catch (error) {
            console.error('[DevSyncPanel] syncNow() lanzó un error:', error);
            appendLog(`syncNow() lanzó: ${error.message}`);
        }
        await handleInspectQueue();
    };

    // Sube el archivo .db de SQLite al backend (requiere conexión) para poder
    // abrirlo en DB Browser for SQLite desde la PC: Expo Go no es debuggable,
    // así que `adb run-as`/`adb pull` no llegan al archivo sin root.
    //
    // OJO: antes esto leía el archivo físico vía FileSystem.readDirectoryAsync sobre
    // defaultDatabaseDirectory (expo-sqlite guarda el .db en su propio directorio nativo,
    // context.filesDir + "/SQLite" en Android, no en FileSystem.documentDirectory). Esa
    // ruta es la correcta a nivel nativo, pero en Expo Go el módulo ExponentFileSystem
    // solo puede leer dentro del sandbox por-experiencia (documentDirectory/cacheDirectory)
    // y rechaza cualquier otra ruta con IOException "isn't readable" — por eso fallaba acá
    // y no antes (el bug es de Expo Go, no de la ruta). serializeAsync() (sqlite3_serialize)
    // da los bytes de la DB directo desde la conexión ya abierta, sin tocar el filesystem.
    const handleExportDb = async () => {
        try {
            const serialized = await serializeDatabase();
            if (!serialized || !serialized.length) {
                appendLog('No se pudo serializar la base de datos (¿todavía no está inicializada?).');
                return;
            }

            const dbFileName = `${DBNAME}.db`;
            const base64 = bytesToBase64(serialized);
            const api = new AxiosManager(wsERPURL);
            const result = await api.post('api/debug/upload-db', { base64, filename: dbFileName });
            appendLog(`Exportado ${dbFileName} (${serialized.length} bytes) -> ${result.path}`);
        } catch (error) {
            appendLog(`Error al exportar DB: ${error.message}`);
        }
    };

    // syncState solo se actualiza al terminar una sincronización exitosa: en pleno modo
    // avión no refleja lo recién encolado. Este botón lee sync_queue directo, sin pasar
    // por SyncState, para confirmar de inmediato que la operación quedó local.
    const handleInspectQueue = async () => {
        try {
            const rows = (await getAllAsyncSql(
                `SELECT id, operation_id, entity, entity_id, action, payload, status, attempts, last_error, next_retry_at FROM sync_queue ORDER BY id DESC LIMIT 10`
            )) || [];
            // console.log no trunca como appendLog, y acá es donde importa ver 'action' y
            // 'payload' completos para saber qué se está mandando realmente al backend.
            console.log('[DevSyncPanel] cola (últimas 10):', JSON.stringify(rows, null, 2));
            appendLog(`cola (últimas 10, ver terminal para el detalle completo): ${JSON.stringify(rows)}`);
        } catch (error) {
            console.error('[DevSyncPanel] Error al inspeccionar la cola:', error);
            appendLog(`Error al inspeccionar la cola: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>DEV — Sync WorkOrders</Text>
            <Text style={styles.status}>
                {`estado=${syncState.status} pendientes=${syncState.pendingCount} fallidas=${syncState.failedCount} permanentes=${syncState.failedPermanentCount} conflictos=${syncState.conflictCount}`}
            </Text>
            <View style={styles.row}>
                <TextInput
                    style={styles.input}
                    placeholder="id_orden_trabajo"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={orderId}
                    onChangeText={setOrderId}
                />
                <TextInput
                    style={styles.input}
                    placeholder="version"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    value={version}
                    onChangeText={setVersion}
                />
            </View>
            <View style={styles.row}>
                <Pressable style={styles.button} onPress={handleSeed}>
                    <Text style={styles.buttonText}>1. Sembrar</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleSimulateChange}>
                    <Text style={styles.buttonText}>2. Cambiar</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleSyncNow}>
                    <Text style={styles.buttonText}>3. Sync ya</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleInspectQueue}>
                    <Text style={styles.buttonText}>4. Ver cola</Text>
                </Pressable>
                <Pressable style={styles.button} onPress={handleExportDb}>
                    <Text style={styles.buttonText}>5. Exportar DB</Text>
                </Pressable>
            </View>
            <Text style={styles.log}>{log}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { backgroundColor: '#111', padding: 8 },
    title: { color: '#4f4', fontWeight: 'bold', fontSize: 12 },
    status: { color: '#4f4', fontSize: 11, marginBottom: 4 },
    row: { flexDirection: 'row', marginBottom: 4 },
    input: { backgroundColor: '#fff', flex: 1, marginRight: 4, paddingHorizontal: 6, borderRadius: 4, height: 32 },
    button: { backgroundColor: '#333', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4, marginRight: 4 },
    buttonText: { color: '#4f4', fontSize: 12 },
    log: { color: '#4f4', fontSize: 10, maxHeight: 80 },
});

export default DevSyncPanel;
