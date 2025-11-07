/**
 * Encrypted Key Backup System for Decentralized Storage
 * Allows users to access their encryption keys from any browser
 */

/**
 * Derive encryption key from user password using PBKDF2
 */
export async function deriveKeyFromPassword(
    password: string,
    salt: Uint8Array
): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );

    // Derive AES key using PBKDF2
    return await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000, // High iteration count for security
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt key backup with user password
 */
export async function encryptKeyBackup(
    keysData: string,
    password: string
): Promise<{
    encryptedData: ArrayBuffer;
    salt: Uint8Array;
    iv: Uint8Array;
}> {
    // Generate random salt and IV
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Derive key from password
    const key = await deriveKeyFromPassword(password, salt);

    // Encrypt the keys data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(keysData);
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        dataBuffer
    );

    return { encryptedData, salt, iv };
}

/**
 * Decrypt key backup with user password
 */
export async function decryptKeyBackup(
    encryptedData: ArrayBuffer,
    password: string,
    salt: Uint8Array,
    iv: Uint8Array
): Promise<string> {
    // Derive key from password
    const key = await deriveKeyFromPassword(password, salt);

    try {
        // Decrypt the data
        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        );

        // Convert back to string
        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        throw new Error('Incorrect password or corrupted backup');
    }
}

/**
 * Convert ArrayBuffer to Base64
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Convert Base64 to ArrayBuffer
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
 * Create backup package for IPFS storage
 */
export async function createBackupPackage(
    walletAddress: string,
    password: string
): Promise<{
    backupData: string;
    ipfsMetadata: any;
}> {
    // Get keys from localStorage
    const keysData = localStorage.getItem(`files_${walletAddress}`);
    if (!keysData) {
        throw new Error('No keys found to backup');
    }

    // Encrypt with password
    const { encryptedData, salt, iv } = await encryptKeyBackup(
        keysData,
        password
    );

    // Create backup package
    const backupPackage = {
        version: '1.0',
        walletAddress,
        encryptedKeys: arrayBufferToBase64(encryptedData),
        salt: Array.from(salt),
        iv: Array.from(iv),
        timestamp: new Date().toISOString(),
    };

    return {
        backupData: JSON.stringify(backupPackage),
        ipfsMetadata: {
            name: `web3vault-backup-${walletAddress.slice(0, 8)}.json`,
            description: 'Encrypted key backup for Web3Vault',
            encrypted: true,
        },
    };
}

/**
 * Restore keys from backup package
 */
export async function restoreFromBackup(
    backupData: string,
    password: string,
    walletAddress: string
): Promise<void> {
    try {
        // Parse backup package
        const backupPackage = JSON.parse(backupData);

        // Verify wallet address matches
        if (backupPackage.walletAddress !== walletAddress) {
            throw new Error(
                'Backup does not match current wallet address'
            );
        }

        // Convert back to binary
        const encryptedData = base64ToArrayBuffer(
            backupPackage.encryptedKeys
        );
        const salt = new Uint8Array(backupPackage.salt);
        const iv = new Uint8Array(backupPackage.iv);

        // Decrypt keys
        const decryptedKeys = await decryptKeyBackup(
            encryptedData,
            password,
            salt,
            iv
        );

        // Validate JSON
        JSON.parse(decryptedKeys);

        // Store in localStorage
        localStorage.setItem(`files_${walletAddress}`, decryptedKeys);

        console.log('✅ Keys restored successfully from backup');
    } catch (error: any) {
        if (error.message.includes('password')) {
            throw new Error('Incorrect password');
        }
        throw new Error('Failed to restore backup: ' + error.message);
    }
}

/**
 * Check if user has cloud backup
 */
export function hasCloudBackup(walletAddress: string): boolean {
    const backupCID = localStorage.getItem(`backup_cid_${walletAddress}`);
    return !!backupCID;
}

/**
 * Get cloud backup CID
 */
export function getCloudBackupCID(walletAddress: string): string | null {
    return localStorage.getItem(`backup_cid_${walletAddress}`);
}

/**
 * Save cloud backup CID
 */
export function saveCloudBackupCID(
    walletAddress: string,
    cid: string
): void {
    localStorage.setItem(`backup_cid_${walletAddress}`, cid);
    localStorage.setItem(
        `backup_timestamp_${walletAddress}`,
        new Date().toISOString()
    );
}
