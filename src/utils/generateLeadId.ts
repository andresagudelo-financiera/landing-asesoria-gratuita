// src/utils/generateLeadId.ts
// Genera un ID de trazabilidad corto y único para cada sesión de formulario.
// Formato: CU-XXXXXX (6 caracteres alfanuméricos en mayúsculas)
// ⚠️ NO contiene PII — es 100% aleatorio sin datos del usuario.

/**
 * Genera un lead_id único con formato CU-XXXXXX.
 * Usa crypto.getRandomValues() cuando está disponible (navegador),
 * con fallback a Math.random() para entornos sin Web Crypto API.
 */
export function generateLeadId(): string {
    const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I/O/0/1 para evitar ambigüedad
    const ID_LENGTH = 6;
    let result = '';

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const array = new Uint8Array(ID_LENGTH);
        crypto.getRandomValues(array);
        for (let i = 0; i < ID_LENGTH; i++) {
            result += CHARS[array[i] % CHARS.length];
        }
    } else {
        for (let i = 0; i < ID_LENGTH; i++) {
            result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
    }

    return `CU-${result}`;
}
