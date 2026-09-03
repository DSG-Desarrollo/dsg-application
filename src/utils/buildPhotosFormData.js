'use strict';

import { File } from 'expo-file-system';

/**
 * Anexa un arreglo de fotos (URIs locales) a un FormData bajo un mismo nombre de
 * campo, como archivo real. Es genérico y reutilizable por cualquier pantalla de la
 * app que necesite subir imágenes a S3, no solo por la evidencia fotográfica de
 * órdenes de trabajo.
 *
 * Usa la API `File` de expo-file-system (en vez de `fetch(uri).then(r => r.blob())`)
 * para leer cada foto: el `fetch` de Expo resuelve `file://` a través de un
 * interceptor de red que, en la práctica, puede no encontrar el archivo (devuelve un
 * 404 cuyo cuerpo es el texto "File not found", que sin este cambio se subía tal
 * cual como si fuera la foto, y el backend la rechazaba en la validación de imagen).
 * `File` lee el archivo directamente del sistema de archivos, sin pasar por la capa
 * de red, y expone `.exists` para detectar de forma explícita una foto que ya no
 * está disponible (p. ej. limpiada del caché) en vez de subir basura silenciosamente.
 *
 * @param {FormData} formData
 * @param {string} fieldName Nombre base del campo multipart (ej. "reception_photos";
 *   cada parte se anexa como "reception_photos[]" para que PHP/Laravel lo reciba
 *   como arreglo, incluso cuando solo hay una foto).
 * @param {string[]} photoUris URIs locales de las fotos a anexar.
 * @throws {Error} Si alguna de las URIs ya no apunta a un archivo existente.
 */
export async function appendPhotosToFormData(formData, fieldName, photoUris = []) {
    for (const uri of photoUris) {
        const file = new File(uri);

        if (!file.exists) {
            throw new Error(`No se encontró el archivo de la foto en ${uri}. Vuelve a tomarla o seleccionarla.`);
        }

        formData.append(`${fieldName}[]`, file);
    }
}

export default appendPhotosToFormData;
