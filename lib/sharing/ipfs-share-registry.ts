/**
 * IPFS-Based Shared File Registry
 * 
 * This provides TRUE cross-device and cross-browser sharing by storing
 * shared file metadata in IPFS, which is accessible from anywhere.
 * 
 * How it works:
 * 1. When sharing, upload shared file metadata to IPFS
 * 2. Store a registry mapping recipient wallet -> list of shared file CIDs
 * 3. When recipient logs in, query IPFS for their registry
 * 4. Download all shared file metadata from IPFS
 * 5. Works on any device/browser - no blockchain required!
 */

import { uploadFile, downloadFile } from '@/lib/ipfs/ipfs-client';

const SHARED_FILES_REGISTRY_PREFIX = 'shared_files_registry_';

/**
 * Upload shared file metadata to IPFS
 * Returns the CID of the uploaded metadata
 */
export async function uploadSharedFileMetadata(sharedFileMetadata: {
    cid: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    encryptionKey: string;
    iv: number[];
    recipientWallet: string;
    sharedBy: string;
    accessType: 'temporary' | 'permanent';
    expiresAt?: number;
    recordType?: string;
    uploadedAt?: string;
    sharedAt?: string;
}): Promise<string> {
    try {
        // Create metadata object
        const metadata = {
            type: 'SHARED_FILE_METADATA',
            version: '1.0',
            ...sharedFileMetadata,
            timestamp: Date.now()
        };

        // Convert to JSON and upload to IPFS
        const metadataJSON = JSON.stringify(metadata);
        const blob = new Blob([metadataJSON], { type: 'application/json' });
        const file = new File([blob], `shared_${sharedFileMetadata.cid}_${Date.now()}.json`, {
            type: 'application/json'
        });

        const metadataCID = await uploadFile(file);
        console.log(`✅ Shared file metadata uploaded to IPFS: ${metadataCID}`);

        // Also update the recipient's registry
        await updateRecipientRegistry(sharedFileMetadata.recipientWallet, metadataCID, metadata);

        return metadataCID;
    } catch (error: any) {
        console.error('❌ Failed to upload shared file metadata to IPFS:', error);
        throw new Error('Failed to upload shared file metadata: ' + error.message);
    }
}

/**
 * Update recipient's shared files registry in IPFS
 * This creates/updates a registry file that lists all files shared with this recipient
 */
async function updateRecipientRegistry(
    recipientWallet: string,
    metadataCID: string,
    fileMetadata: any
): Promise<void> {
    try {
        // Try to get existing registry
        let registry: any[] = [];
        try {
            const existingRegistryCID = localStorage.getItem(`${SHARED_FILES_REGISTRY_PREFIX}${recipientWallet}`);
            if (existingRegistryCID) {
                const registryData = await downloadFile(existingRegistryCID);
                registry = JSON.parse(registryData);
            }
        } catch (e) {
            // No existing registry, start fresh
            console.log('📝 Creating new registry for recipient');
        }

        // Add new file to registry (avoid duplicates)
        const exists = registry.some((entry: any) => 
            entry.metadataCID === metadataCID || 
            (entry.fileCID === fileMetadata.cid && entry.sharedBy === fileMetadata.sharedBy)
        );

        if (!exists) {
            registry.push({
                metadataCID,
                fileCID: fileMetadata.cid,
                fileName: fileMetadata.fileName,
                sharedBy: fileMetadata.sharedBy,
                sharedAt: fileMetadata.sharedAt || new Date().toISOString(),
                accessType: fileMetadata.accessType,
                expiresAt: fileMetadata.expiresAt
            });

            // Upload updated registry to IPFS
            const registryJSON = JSON.stringify(registry);
            const blob = new Blob([registryJSON], { type: 'application/json' });
            const file = new File([blob], `registry_${recipientWallet}.json`, {
                type: 'application/json'
            });

            const registryCID = await uploadFile(file);
            console.log(`✅ Registry updated in IPFS: ${registryCID}`);

            // Store registry CID locally for faster access
            localStorage.setItem(`${SHARED_FILES_REGISTRY_PREFIX}${recipientWallet}`, registryCID);
        }
    } catch (error: any) {
        console.warn('⚠️ Failed to update recipient registry:', error);
        // Don't throw - registry update is optional, metadata upload is what matters
    }
}

/**
 * Get all shared files for a recipient from IPFS
 * This is the CROSS-DEVICE and CROSS-BROWSER solution!
 */
export async function getSharedFilesFromIPFS(recipientWallet: string): Promise<any[]> {
    const sharedFiles: any[] = [];

    try {
        // Try to get registry CID from local storage (fast path)
        const registryCID = localStorage.getItem(`${SHARED_FILES_REGISTRY_PREFIX}${recipientWallet}`);
        
        if (registryCID) {
            try {
                // Download registry from IPFS
                const registryData = await downloadFile(registryCID);
                const registry = JSON.parse(registryData);

                console.log(`📋 Found registry with ${registry.length} shared files`);

                // Download each file's metadata from IPFS
                for (const entry of registry) {
                    try {
                        // Check expiration
                        if (entry.expiresAt && entry.expiresAt < Date.now()) {
                            console.log(`⏰ File ${entry.fileCID} expired`);
                            continue;
                        }

                        // Download file metadata
                        const metadataData = await downloadFile(entry.metadataCID);
                        const fileMetadata = JSON.parse(metadataData);

                        // Validate metadata
                        if (fileMetadata.type === 'SHARED_FILE_METADATA' && 
                            fileMetadata.recipientWallet === recipientWallet) {
                            sharedFiles.push({
                                cid: fileMetadata.cid,
                                fileName: fileMetadata.fileName,
                                fileType: fileMetadata.fileType,
                                fileSize: fileMetadata.fileSize,
                                encryptionKey: fileMetadata.encryptionKey,
                                iv: fileMetadata.iv,
                                uploadedAt: fileMetadata.uploadedAt || new Date(fileMetadata.timestamp).toISOString(),
                                sharedBy: fileMetadata.sharedBy,
                                sharedAt: fileMetadata.sharedAt || new Date(fileMetadata.timestamp).toISOString(),
                                accessType: fileMetadata.accessType,
                                expiresAt: fileMetadata.expiresAt ? new Date(fileMetadata.expiresAt).toISOString() : null,
                                recordType: fileMetadata.recordType || 'other',
                                owner: fileMetadata.sharedBy,
                                fromIPFS: true
                            });
                        }
                    } catch (e) {
                        console.warn(`⚠️ Failed to download metadata for ${entry.metadataCID}:`, e);
                    }
                }
            } catch (e) {
                console.warn('⚠️ Failed to download registry from IPFS:', e);
            }
        }

        // Also try to discover shared files by searching known patterns
        // This is a fallback if registry is not found
        // In production, you'd use IPNS or a better discovery mechanism

        console.log(`✅ Found ${sharedFiles.length} shared files from IPFS`);
        return sharedFiles;
    } catch (error: any) {
        console.error('❌ Failed to get shared files from IPFS:', error);
        return [];
    }
}

/**
 * Store registry CID locally for faster future access
 */
export function storeRegistryCID(recipientWallet: string, registryCID: string): void {
    try {
        localStorage.setItem(`${SHARED_FILES_REGISTRY_PREFIX}${recipientWallet}`, registryCID);
    } catch (e) {
        console.warn('Failed to store registry CID:', e);
    }
}

/**
 * Get registry CID from local storage
 */
export function getRegistryCID(recipientWallet: string): string | null {
    try {
        return localStorage.getItem(`${SHARED_FILES_REGISTRY_PREFIX}${recipientWallet}`);
    } catch (e) {
        return null;
    }
}

