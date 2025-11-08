/**
 * IPFS Upload & Download using Pinata
 * Decentralized file storage on IPFS network
 * 
 * FLOW:
 * 1. Upload encrypted file to Pinata IPFS
 * 2. Get CID (Content Identifier) - permanent IPFS address
 * 3. Store CID on blockchain with encryption keys
 * 4. Download from any device using CID
 * 5. Decrypt using keys from blockchain
 */

import { arrayBufferToBase64, base64ToArrayBuffer } from '../encryption/medical-encryption';

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
const PINATA_GATEWAY = 'https://gateway.pinata.cloud';

interface UploadMetadata {
    fileName: string;
    fileType: string;
    recordType: string;
    iv: Uint8Array;
    patientId: string;
}

interface UploadResult {
    cid: string;
    ipfsUrl: string;
    pinataUrl: string;
}

/**
 * Upload encrypted file to IPFS via Pinata
 * @param encryptedData - Encrypted file data (ArrayBuffer)
 * @param metadata - File metadata
 * @param onProgress - Progress callback (0-100)
 * @returns CID and IPFS URLs
 */
export async function uploadToIPFS(
    encryptedData: ArrayBuffer,
    metadata: UploadMetadata,
    onProgress?: (progress: number) => void
): Promise<UploadResult> {
    try {
        if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
            throw new Error(
                'Pinata API keys not configured. Please add NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY to .env.local'
            );
        }

        onProgress?.(10);

        // Convert ArrayBuffer to Blob
        const blob = new Blob([encryptedData], { type: 'application/octet-stream' });

        // Create FormData
        const formData = new FormData();
        formData.append('file', blob, metadata.fileName);

        // Add metadata to Pinata
        const pinataMetadata = {
            name: metadata.fileName,
            keyvalues: {
                fileType: metadata.fileType,
                recordType: metadata.recordType,
                encrypted: 'true',
                uploadDate: new Date().toISOString(),
                patientId: metadata.patientId,
            }
        };

        formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

        onProgress?.(30);

        // Upload to Pinata
        console.log('📤 Uploading to Pinata IPFS...');
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
            },
            body: formData,
        });

        onProgress?.(80);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const cid = result.IpfsHash;

        onProgress?.(100);

        console.log('✅ File uploaded to IPFS!');
        console.log('📦 CID:', cid);
        console.log('🌐 IPFS URL:', `https://ipfs.io/ipfs/${cid}`);
        console.log('🔗 Pinata Gateway:', `${PINATA_GATEWAY}/ipfs/${cid}`);

        return {
            cid,
            ipfsUrl: `https://ipfs.io/ipfs/${cid}`,
            pinataUrl: `${PINATA_GATEWAY}/ipfs/${cid}`,
        };
    } catch (error: any) {
        console.error('❌ IPFS upload failed:', error);
        throw new Error(`Failed to upload to IPFS: ${error.message}`);
    }
}

/**
 * Download encrypted file from IPFS using CID
 * @param cid - Content Identifier from IPFS
 * @param onProgress - Progress callback (0-100)
 * @returns Encrypted file data (ArrayBuffer)
 */
export async function downloadFromIPFS(
    cid: string,
    onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
    try {
        onProgress?.(10);

        // Try multiple gateways for reliability
        const gateways = [
            `${PINATA_GATEWAY}/ipfs/${cid}`,
            `https://ipfs.io/ipfs/${cid}`,
            `https://cloudflare-ipfs.com/ipfs/${cid}`,
            `https://gateway.ipfs.io/ipfs/${cid}`,
        ];

        console.log('📥 Downloading from IPFS...');
        console.log('🔍 CID:', cid);

        onProgress?.(30);

        let lastError: Error | null = null;

        // Try each gateway
        for (const gateway of gateways) {
            try {
                console.log('🌐 Trying gateway:', gateway);

                const response = await fetch(gateway, {
                    headers: {
                        'Accept': 'application/octet-stream',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Gateway ${gateway} failed: ${response.status}`);
                }

                onProgress?.(70);

                const arrayBuffer = await response.arrayBuffer();

                onProgress?.(100);

                console.log('✅ File downloaded from IPFS');
                console.log('📦 Size:', (arrayBuffer.byteLength / 1024).toFixed(2), 'KB');

                return arrayBuffer;
            } catch (error: any) {
                console.warn(`⚠️ Gateway ${gateway} failed:`, error.message);
                lastError = error;
                continue; // Try next gateway
            }
        }

        // All gateways failed
        throw lastError || new Error('All IPFS gateways failed');
    } catch (error: any) {
        console.error('❌ IPFS download failed:', error);
        throw new Error(`Failed to download from IPFS: ${error.message}`);
    }
}

/**
 * Upload metadata to IPFS (for share links)
 * @param metadata - Metadata object
 * @returns CID of metadata
 */
export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
    try {
        if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
            throw new Error('Pinata API keys not configured');
        }

        const metadataJson = JSON.stringify(metadata);
        const blob = new Blob([metadataJson], { type: 'application/json' });

        const formData = new FormData();
        formData.append('file', blob, 'metadata.json');

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Metadata upload failed: ${response.status}`);
        }

        const result = await response.json();
        return result.IpfsHash;
    } catch (error: any) {
        console.error('❌ Metadata upload failed:', error);
        throw error;
    }
}

/**
 * Download metadata from IPFS
 * @param cid - Metadata CID
 * @returns Metadata object
 */
export async function downloadMetadataFromIPFS(cid: string): Promise<any> {
    try {
        const gateways = [
            `${PINATA_GATEWAY}/ipfs/${cid}`,
            `https://ipfs.io/ipfs/${cid}`,
        ];

        for (const gateway of gateways) {
            try {
                const response = await fetch(gateway);
                if (response.ok) {
                    return await response.json();
                }
            } catch (error) {
                continue;
            }
        }

        throw new Error('Failed to download metadata from all gateways');
    } catch (error: any) {
        console.error('❌ Metadata download failed:', error);
        throw error;
    }
}

/**
 * Get pinned files list from Pinata (for user's files)
 */
export async function getPinnedFiles(): Promise<any[]> {
    try {
        if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
            return [];
        }

        const response = await fetch('https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=100', {
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
            },
        });

        if (!response.ok) {
            return [];
        }

        const result = await response.json();
        return result.rows || [];
    } catch (error) {
        console.error('❌ Failed to get pinned files:', error);
        return [];
    }
}

/**
 * Unpin file from Pinata (delete)
 */
export async function unpinFile(cid: string): Promise<boolean> {
    try {
        if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
            return false;
        }

        const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
            method: 'DELETE',
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY,
            },
        });

        return response.ok;
    } catch (error) {
        console.error('❌ Failed to unpin file:', error);
        return false;
    }
}
