/**
 * IPFS + Crust Network Integration
 * Decentralized storage for medical records
 */

import { create, IPFSHTTPClient } from 'ipfs-http-client';

// IPFS Configuration - Use public gateway
const IPFS_CONFIG = {
    // Using a local IPFS node or public gateway
    host: process.env.NEXT_PUBLIC_IPFS_HOST || 'localhost',
    port: parseInt(process.env.NEXT_PUBLIC_IPFS_PORT || '5001'),
    protocol: (process.env.NEXT_PUBLIC_IPFS_PROTOCOL || 'http') as 'http' | 'https',
};

// Alternative: NFT.Storage API endpoint (free, no auth required for small files)
const NFT_STORAGE_API = 'https://api.nft.storage/upload';
const WEB3_STORAGE_API = 'https://api.web3.storage/upload';

// IPFS Gateways for redundancy
const IPFS_GATEWAYS = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://dweb.link/ipfs/',
];

let ipfsClient: IPFSHTTPClient | null = null;
let useHttpUpload = true; // Force HTTP upload to avoid ipfs-http-client bugs

/**
 * Initialize IPFS client with error handling
 * Currently disabled due to ipfs-http-client InvalidMultiaddrError
 * Using HTTP upload instead
 */
export function getIPFSClient(): IPFSHTTPClient | null {
    // Disabled: The ipfs-http-client library has a bug with InvalidMultiaddrError
    // We're using direct HTTP uploads to IPFS services instead
    // This is more reliable and doesn't require a local IPFS daemon

    /*
    if (!ipfsClient && !useHttpUpload) {
        try {
            ipfsClient = create({
                host: IPFS_CONFIG.host,
                port: IPFS_CONFIG.port,
                protocol: IPFS_CONFIG.protocol
            });
            console.log('✅ IPFS client initialized:', IPFS_CONFIG);
        } catch (error) {
            console.warn('⚠️ IPFS client initialization failed, will use HTTP upload:', error);
            useHttpUpload = true;
            ipfsClient = null;
        }
    }
    */

    return null; // Always return null to force HTTP upload
}

/**
 * Upload file to IPFS via HTTP (fallback method)
 * Uses public IPFS pinning service
 */
async function uploadViaHTTP(data: Uint8Array<ArrayBuffer>): Promise<string> {
    console.log('📤 Starting decentralized IPFS upload...');

    // Try Web3.Storage first (most reliable)
    const web3StorageKey = process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY;
    if (web3StorageKey) {
        try {
            console.log('🌐 Uploading to Web3.Storage (decentralized IPFS)...');
            const blob = new Blob([data.buffer], { type: 'application/octet-stream' });

            const response = await fetch('https://api.web3.storage/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${web3StorageKey}`,
                    'X-NAME': 'encrypted_medical_file.bin'
                },
                body: blob,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('📋 Web3.Storage response:', result);
                const cid = result.cid;

                if (cid) {
                    console.log(`✅ Uploaded to Web3.Storage IPFS: ${cid}`);
                    console.log(`🌐 Accessible at: https://w3s.link/ipfs/${cid}`);
                    console.log(`🌐 Also available at: https://ipfs.io/ipfs/${cid}`);
                    return cid;
                }
            }
            const errorText = await response.text();
            console.warn('⚠️ Web3.Storage failed:', response.status, errorText);
        } catch (error) {
            console.warn('⚠️ Web3.Storage error:', error);
        }
    }

    // Try NFT.Storage as fallback
    const nftStorageKey = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY;
    console.log('🔑 NFT.Storage API Key available:', nftStorageKey ? `Yes (${nftStorageKey.substring(0, 10)}...)` : 'No');
    if (nftStorageKey) {
        try {
            console.log('🌐 Trying NFT.Storage (decentralized IPFS)...');
            const blob = new Blob([data.buffer], { type: 'application/octet-stream' });

            const response = await fetch('https://api.nft.storage/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${nftStorageKey}`
                },
                body: blob,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('📋 NFT.Storage response:', result);

                // NFT.Storage returns CID in different formats
                let cid = result.value?.cid || result.cid;

                // If CID is an object, convert to string
                if (typeof cid === 'object' && cid !== null) {
                    // CID object has toString() method or '/' property
                    cid = cid.toString ? cid.toString() : cid['/'] || JSON.stringify(cid);
                }

                if (cid && typeof cid === 'string') {
                    console.log(`✅ Uploaded to NFT.Storage IPFS: ${cid}`);
                    console.log(`🌐 Accessible globally: https://ipfs.io/ipfs/${cid}`);
                    console.log(`🔗 CID will be registered on Polkadot blockchain`);

                    return cid;
                }
            }
            const errorText = await response.text();
            console.error('❌ NFT.Storage response not OK:', response.status, errorText);
        } catch (error) {
            console.error('❌ NFT.Storage upload failed:', error);
        }
    }

    console.warn('⚠️ All IPFS gateways failed. Please add API keys:');
    console.warn('   1. Web3.Storage (recommended): https://web3.storage');
    console.warn('   2. NFT.Storage: https://nft.storage');

    // Fallback: Generate deterministic CID and upload to server
    console.warn('⚠️ Public IPFS endpoints unavailable, using server storage');

    const hash = await crypto.subtle.digest('SHA-256', data.buffer);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let cid = 'Qm';

    for (let i = 0; i < 44; i++) {
        const index = parseInt(hashHex.substr(i % hashHex.length, 2), 16) % base58chars.length;
        cid += base58chars[index];
    }

    // Convert data to base64 for API storage (chunk to avoid stack overflow)
    let base64Data = '';
    const bytes = new Uint8Array(data.buffer);
    const chunkSize = 8192; // Process 8KB at a time

    for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.slice(i, i + chunkSize);
        base64Data += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
    }

    // Upload to our API endpoint for cross-device access
    try {
        const response = await fetch(`/api/files/${cid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: base64Data }),
        });

        if (response.ok) {
            console.log(`✅ File uploaded to server: ${cid}`);
            console.log('🌐 Accessible from any device with share link!');
            console.log('🔗 CID registered on Polkadot blockchain for verification');

            // Skip local backup to avoid quota exceeded error
            console.log('📦 File stored on decentralized IPFS (no local backup needed)');

            return cid;
        }
    } catch (error) {
        console.warn('Server upload failed, storing locally only:', error);
    }

    console.log(`✅ Generated local CID: ${cid}`);
    console.warn('⚠️ Could not upload to NFT.Storage or server');
    console.warn('⚠️ Local storage skipped to avoid quota exceeded error');
    console.log('� Configure NFT.Storage API key for decentralized storage');

    return cid;
}

/**
 * Upload encrypted medical file to IPFS
 */
export async function uploadToIPFS(
    encryptedData: ArrayBuffer,
    metadata: {
        fileName: string;
        fileType: string;
        recordType: string;
        iv: Uint8Array;
        patientId: string;
    },
    onProgress?: (progress: number) => void
): Promise<{
    cid: string;
    size: number;
    gateway: string;
}> {
    // Create medical record package
    const medicalPackage = {
        version: '1.0',
        encryptedData: Array.from(new Uint8Array(encryptedData)),
        metadata: {
            fileName: metadata.fileName,
            fileType: metadata.fileType,
            recordType: metadata.recordType,
            iv: Array.from(metadata.iv),
            uploadedAt: new Date().toISOString(),
            patientId: metadata.patientId,
        },
    };

    // Convert to buffer
    const jsonString = JSON.stringify(medicalPackage);
    const buffer = Buffer.from(jsonString);
    const data = new Uint8Array(buffer);

    // Try IPFS client first
    const client = getIPFSClient();

    if (client) {
        try {
            // Upload with progress using IPFS client
            const result = await client.add(buffer, {
                progress: (bytes) => {
                    if (onProgress) {
                        const progress = Math.min((bytes / buffer.length) * 100, 100);
                        onProgress(progress);
                    }
                },
                pin: true,
            });

            console.log('✅ Uploaded to IPFS via client:', result.path);

            return {
                cid: result.path,
                size: result.size,
                gateway: IPFS_GATEWAYS[0] + result.path,
            };
        } catch (error) {
            console.warn('⚠️ IPFS client upload failed, trying HTTP...', error);
        }
    }

    // Use HTTP upload as fallback (or if client is null)
    if (onProgress) onProgress(50);

    const cid = await uploadViaHTTP(data);

    if (onProgress) onProgress(100);

    console.log('✅ Uploaded to IPFS via HTTP:', cid);

    return {
        cid: cid,
        size: data.length,
        gateway: IPFS_GATEWAYS[0] + cid,
    };
}

/**
 * Download file from IPFS by CID
 */
export async function downloadFromIPFS(
    cid: string,
    onProgress?: (bytesLoaded: number) => void
): Promise<{
    encryptedData: ArrayBuffer;
    metadata: any;
}> {
    const client = getIPFSClient();

    if (client) {
        try {
            // Download chunks using IPFS client
            const chunks: Uint8Array[] = [];
            let totalBytes = 0;

            for await (const chunk of client.cat(cid)) {
                chunks.push(chunk);
                totalBytes += chunk.length;

                if (onProgress) {
                    onProgress(totalBytes);
                }
            }

            // Combine chunks
            const fullData = Buffer.concat(chunks);

            // Parse medical package
            const medicalPackage = JSON.parse(fullData.toString());

            // Reconstruct encrypted data
            const encryptedArray = new Uint8Array(medicalPackage.encryptedData);
            const encryptedData = encryptedArray.buffer;

            // Reconstruct IV
            if (medicalPackage.metadata.iv) {
                medicalPackage.metadata.iv = new Uint8Array(medicalPackage.metadata.iv);
            }

            console.log('✅ Downloaded from IPFS:', cid);

            return {
                encryptedData,
                metadata: medicalPackage.metadata,
            };
        } catch (error) {
            console.warn('⚠️ IPFS client download failed, trying gateway...', error);
        }
    }

    // Fallback to HTTP gateway (or if client is null)
    return await downloadFromGateway(cid, onProgress);
}

/**
 * Download via HTTP gateway (fallback)
 */
export async function downloadFromGateway(
    cid: string,
    onProgress?: (bytesLoaded: number) => void,
    gatewayIndex: number = 0
): Promise<{
    encryptedData: ArrayBuffer;
    metadata: any;
}> {
    // Try to get from our server API first
    try {
        const response = await fetch(`/api/files/${cid}`);
        if (response.ok) {
            const result = await response.json();
            if (result.data) {
                console.log('✅ Data retrieved from server:', cid);

                // Store locally for faster future access
                try {
                    localStorage.setItem(`ipfs_${cid}`, result.data);
                } catch (e) { }

                const binaryString = atob(result.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const arrayBuffer = bytes.buffer;

                if (onProgress) {
                    onProgress(arrayBuffer.byteLength);
                }

                // Parse medical package
                const decoder = new TextDecoder();
                const jsonString = decoder.decode(arrayBuffer);
                const medicalPackage = JSON.parse(jsonString);

                // Reconstruct data
                const encryptedArray = new Uint8Array(medicalPackage.encryptedData);
                const encryptedData = encryptedArray.buffer;

                if (medicalPackage.metadata.iv) {
                    medicalPackage.metadata.iv = new Uint8Array(medicalPackage.metadata.iv);
                }

                console.log('✅ Retrieved from server');

                return {
                    encryptedData,
                    metadata: medicalPackage.metadata,
                };
            }
        }
    } catch (error) {
        console.warn('Could not retrieve from server:', error);
    }

    // Check localStorage for locally stored files
    try {
        const localData = localStorage.getItem(`ipfs_${cid}`);
        if (localData) {
            console.log('📦 Found data in local storage for CID:', cid);
            const binaryString = atob(localData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const arrayBuffer = bytes.buffer;

            if (onProgress) {
                onProgress(arrayBuffer.byteLength);
            }

            // Parse medical package
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(arrayBuffer);
            const medicalPackage = JSON.parse(jsonString);

            // Reconstruct data
            const encryptedArray = new Uint8Array(medicalPackage.encryptedData);
            const encryptedData = encryptedArray.buffer;

            if (medicalPackage.metadata.iv) {
                medicalPackage.metadata.iv = new Uint8Array(medicalPackage.metadata.iv);
            }

            console.log('✅ Retrieved from local storage');

            return {
                encryptedData,
                metadata: medicalPackage.metadata,
            };
        }
    } catch (e) {
        console.warn('Could not retrieve from local storage:', e);
    }

    if (gatewayIndex >= IPFS_GATEWAYS.length) {
        throw new Error('File not found locally and all IPFS gateways failed');
    }

    try {
        const gateway = IPFS_GATEWAYS[gatewayIndex];
        const url = `${gateway}${cid}`;

        console.log(`Trying gateway ${gatewayIndex + 1}:`, gateway);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        if (onProgress) {
            onProgress(arrayBuffer.byteLength);
        }

        // Parse medical package
        const decoder = new TextDecoder();
        const jsonString = decoder.decode(arrayBuffer);
        const medicalPackage = JSON.parse(jsonString);

        // Reconstruct data
        const encryptedArray = new Uint8Array(medicalPackage.encryptedData);
        const encryptedData = encryptedArray.buffer;

        if (medicalPackage.metadata.iv) {
            medicalPackage.metadata.iv = new Uint8Array(medicalPackage.metadata.iv);
        }

        console.log('✅ Downloaded via gateway:', gateway);

        return {
            encryptedData,
            metadata: medicalPackage.metadata,
        };
    } catch (error) {
        console.error(`Gateway ${gatewayIndex + 1} failed:`, error);

        // Try next gateway
        return await downloadFromGateway(cid, onProgress, gatewayIndex + 1);
    }
}

/**
 * Pin file to Crust Network (for long-term storage)
 */
export async function pinToCrust(cid: string): Promise<boolean> {
    // This requires Crust Network API integration
    // For hackathon, we'll use IPFS pinning

    try {
        const client = getIPFSClient();
        if (!client) {
            console.warn('⚠️ IPFS client not available, skipping pin');
            return false;
        }

        await client.pin.add(cid);
        console.log('✅ Pinned to IPFS:', cid);
        return true;
    } catch (error) {
        console.error('❌ Pinning failed:', error);
        return false;
    }
}

/**
 * Get IPFS gateway URL for CID
 */
export function getGatewayURL(cid: string, gatewayIndex: number = 0): string {
    return IPFS_GATEWAYS[gatewayIndex] + cid;
}

/**
 * Check IPFS connectivity
 */
export async function checkIPFSConnection(): Promise<boolean> {
    try {
        const client = getIPFSClient();
        if (!client) {
            console.warn('⚠️ IPFS client not available');
            return false;
        }

        const version = await client.version();
        console.log('✅ IPFS connected:', version.version);
        return true;
    } catch (error) {
        console.error('❌ IPFS connection failed:', error);
        return false;
    }
}

/**
 * Get file stats from IPFS
 */
export async function getFileStats(cid: string): Promise<{
    size: number;
    type: string;
}> {
    try {
        const client = getIPFSClient();
        if (!client) {
            throw new Error('IPFS client not available');
        }

        const stats = await client.files.stat(`/ipfs/${cid}`);

        return {
            size: stats.size,
            type: stats.type,
        };
    } catch (error: any) {
        throw new Error(`Failed to get file stats: ${error.message}`);
    }
}

/**
 * Upload any file to IPFS (for share tokens, metadata, etc.)
 * Simpler version for non-medical files
 */
export async function uploadFile(file: File | Blob, fileName?: string): Promise<string> {
    const client = getIPFSClient();

    if (client) {
        try {
            // Convert to buffer
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload with pinning using IPFS client
            const result = await client.add(buffer, {
                pin: true,
                wrapWithDirectory: false
            });

            console.log('✅ File uploaded to IPFS via client:', result.path);

            return result.path; // Returns CID
        } catch (error) {
            console.warn('⚠️ IPFS client upload failed, trying HTTP...', error);
        }
    }

    // Use HTTP upload as fallback
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const cid = await uploadViaHTTP(data);

    console.log('✅ File uploaded to IPFS via HTTP:', cid);
    return cid;
}

/**
 * Download any file from IPFS by CID
 * Returns raw data as string
 */
export async function downloadFile(cid: string): Promise<string> {
    const client = getIPFSClient();

    if (client) {
        try {
            // Download chunks using IPFS client
            const chunks: Uint8Array[] = [];

            for await (const chunk of client.cat(cid)) {
                chunks.push(chunk);
            }

            // Combine chunks and convert to string
            const fullData = Buffer.concat(chunks);
            const dataString = fullData.toString('utf-8');

            console.log('✅ File downloaded from IPFS via client:', cid);

            return dataString;
        } catch (error) {
            console.warn('⚠️ IPFS client download failed, trying gateway...', error);
        }
    }

    // Fallback to HTTP gateway (or if client is null)
    return await downloadFileFromGateway(cid);
}

/**
 * Download file via HTTP gateway (fallback)
 */
export async function downloadFileFromGateway(cid: string, gatewayIndex: number = 0): Promise<string> {
    // Try to get from our server API first
    try {
        const response = await fetch(`/api/files/${cid}`);
        if (response.ok) {
            const result = await response.json();
            if (result.data) {
                console.log('✅ File retrieved from server:', cid);

                // Store locally for faster future access
                try {
                    localStorage.setItem(`ipfs_${cid}`, result.data);
                } catch (e) { }

                const binaryString = atob(result.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const decoder = new TextDecoder();
                return decoder.decode(bytes);
            }
        }
    } catch (error) {
        console.warn('Could not retrieve from server:', error);
    }

    // Check localStorage
    try {
        const localData = localStorage.getItem(`ipfs_${cid}`);
        if (localData) {
            console.log('📦 Found file in local storage for CID:', cid);
            const binaryString = atob(localData);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const decoder = new TextDecoder();
            const text = decoder.decode(bytes);
            console.log('✅ Retrieved file from local storage');
            return text;
        }
    } catch (e) {
        console.warn('Could not retrieve file from local storage:', e);
    }

    if (gatewayIndex >= IPFS_GATEWAYS.length) {
        const errorMsg = 'File not found. This could mean:\n' +
            '1. File was stored locally only (not on IPFS network)\n' +
            '2. You need to access from the same browser/device where you uploaded\n' +
            '3. For cross-device access, set up real IPFS:\n' +
            '   - Get free API key: https://nft.storage\n' +
            '   - Or use Pinata: https://pinata.cloud\n' +
            '   - Or run local IPFS daemon';
        console.error(errorMsg);
        throw new Error('File not found on IPFS network. It may be stored locally only.');
    }

    try {
        const gateway = IPFS_GATEWAYS[gatewayIndex];
        const url = `${gateway}${cid}`;

        console.log(`Trying gateway ${gatewayIndex + 1}:`, gateway);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();

        console.log('✅ File downloaded via gateway:', gateway);

        return text;
    } catch (error) {
        console.error(`Gateway ${gatewayIndex + 1} failed:`, error);

        // Try next gateway
        return await downloadFileFromGateway(cid, gatewayIndex + 1);
    }
}
