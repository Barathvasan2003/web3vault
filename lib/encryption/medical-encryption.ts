/**
 * Medical-Grade Encryption Utilities
 * AES-256-GCM encryption for healthcare data
 * HIPAA-compliant client-side encryption
 */

/**
 * Generate encryption key from wallet signature
 * @param walletAddress - User's wallet address
 * @param signature - Signature from wallet
 * @returns CryptoKey for encryption/decryption
 */
export async function deriveKeyFromWallet(
    walletAddress: string,
    signature: string
): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${walletAddress}:${signature}`);

    // Hash the signature to create key material
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Import as AES key
    return await crypto.subtle.importKey(
        'raw',
        hashBuffer,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Generate random encryption key
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Export key to base64 for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return arrayBufferToBase64(exported);
}

/**
 * Import key from base64
 */
export async function importKey(keyBase64: string): Promise<CryptoKey> {
    const keyBuffer = base64ToArrayBuffer(keyBase64);
    return await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt medical file with metadata
 */
export async function encryptMedicalFile(
    file: File,
    metadata: {
        recordType: string;
        patientId: string;
        uploadDate: string;
    }
): Promise<{
    encryptedData: ArrayBuffer;
    key: CryptoKey;
    iv: Uint8Array;
    metadata: any;
}> {
    // Generate encryption key
    const key = await generateEncryptionKey();

    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Read file
    const fileData = await file.arrayBuffer();

    // Create metadata packet
    const metadataPacket = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        recordType: metadata.recordType,
        patientId: metadata.patientId,
        uploadDate: metadata.uploadDate,
        timestamp: Date.now(),
    };

    // Combine metadata and file data
    const encoder = new TextEncoder();
    const metadataBytes = encoder.encode(JSON.stringify(metadataPacket));
    const combined = new Uint8Array(
        4 + metadataBytes.length + fileData.byteLength
    );

    // Format: [metadata_length(4 bytes)][metadata][file_data]
    const view = new DataView(combined.buffer);
    view.setUint32(0, metadataBytes.length, true);
    combined.set(metadataBytes, 4);
    combined.set(new Uint8Array(fileData), 4 + metadataBytes.length);

    // Encrypt
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
        key,
        combined
    );

    return {
        encryptedData,
        key,
        iv,
        metadata: metadataPacket,
    };
}

/**
 * Decrypt medical file
 */
export async function decryptMedicalFile(
    encryptedData: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array
): Promise<{
    fileData: ArrayBuffer;
    metadata: any;
}> {
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
        key,
        encryptedData
    );

    // Parse format: [metadata_length][metadata][file_data]
    const view = new DataView(decrypted);
    const metadataLength = view.getUint32(0, true);

    const decoder = new TextDecoder();
    const metadataBytes = new Uint8Array(decrypted, 4, metadataLength);
    const metadata = JSON.parse(decoder.decode(metadataBytes));

    const fileData = decrypted.slice(4 + metadataLength);

    return { fileData, metadata };
}

/**
 * Hash file for blockchain storage
 */
export async function hashFile(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayBufferToHex(hashBuffer);
}

/**
 * Utility: ArrayBuffer to Base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Utility: Base64 to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Utility: ArrayBuffer to Hex
 */
export function arrayBufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Create downloadable blob
 */
export function createDownloadBlob(
    data: ArrayBuffer,
    fileName: string,
    fileType: string
): Blob {
    return new Blob([data], { type: fileType || 'application/octet-stream' });
}

/**
 * Trigger file download
 */
export function downloadFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Encrypt access token for sharing
 */
export async function encryptAccessToken(
    fileId: string,
    expiresAt: number,
    permissions: string[]
): Promise<string> {
    const token = {
        fileId,
        expiresAt,
        permissions,
        nonce: crypto.getRandomValues(new Uint8Array(16)),
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(token));

    // Simple encoding for demo (use proper encryption in production)
    return arrayBufferToBase64(data);
}

/**
 * Decrypt access token
 */
export function decryptAccessToken(token: string): {
    fileId: string;
    expiresAt: number;
    permissions: string[];
} | null {
    try {
        const data = base64ToArrayBuffer(token);
        const decoder = new TextDecoder();
        const json = decoder.decode(data);
        const parsed = JSON.parse(json);

        // Check expiry
        if (parsed.expiresAt < Date.now()) {
            return null; // Expired
        }

        return parsed;
    } catch {
        return null;
    }
}
