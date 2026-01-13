/**
 * Simple E2E Encryption helper using Web Crypto API (AES-GCM)
 * Foundation for Phase 5 Security
 */

const ENCRYPTION_ALGORITHM = 'AES-GCM';

/**
 * Generate a new encryption key for a conversation
 */
export async function generateKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
        {
            name: ENCRYPTION_ALGORITHM,
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Export a key to a base64 string (to be stored in IndexedDB or similar, NOT sent to server unencrypted)
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Import a key from a base64 string
 */
export async function importKey(keyStr: string): Promise<CryptoKey> {
    const keyData = new Uint8Array(atob(keyStr).split('').map(c => c.charCodeAt(0)));
    return window.crypto.subtle.importKey(
        'raw',
        keyData,
        ENCRYPTION_ALGORITHM,
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt a text message
 */
export async function encryptMessage(text: string, key: CryptoKey): Promise<{ encrypted: string, iv: string }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: ENCRYPTION_ALGORITHM,
            iv: iv,
        },
        key,
        encoded
    );

    return {
        encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv)),
    };
}

/**
 * Decrypt a text message
 */
export async function decryptMessage(encryptedStr: string, ivStr: string, key: CryptoKey): Promise<string> {
    const encrypted = new Uint8Array(atob(encryptedStr).split('').map(c => c.charCodeAt(0)));
    const iv = new Uint8Array(atob(ivStr).split('').map(c => c.charCodeAt(0)));

    const decrypted = await window.crypto.subtle.decrypt(
        {
            name: ENCRYPTION_ALGORITHM,
            iv: iv,
        },
        key,
        encrypted
    );

    return new TextDecoder().decode(decrypted);
}
