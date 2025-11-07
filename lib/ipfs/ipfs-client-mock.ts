/**
 * Mock IPFS Client for Demo/Local Mode
 * Simulates IPFS uploads without actually connecting to IPFS network
 * This avoids the multiaddr/webpack issues while still demonstrating the flow
 */

interface UploadResult {
    cid: string;
    size: number;
}

interface DownloadResult {
    encryptedData: ArrayBuffer;
    metadata: any;
}

/**
 * Simulate IPFS upload by storing in browser (localStorage fallback)
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
): Promise<UploadResult> {
    try {
        // Simulate upload progress
        onProgress?.(0);
        await delay(300);
        onProgress?.(0.3);
        await delay(300);
        onProgress?.(0.6);
        await delay(300);
        onProgress?.(0.9);
        await delay(200);
        onProgress?.(1.0);

        // Generate mock CID (Content Identifier)
        const cid = generateMockCID();

        // Store in localStorage for demo mode (so we can retrieve it later)
        const bytes = new Uint8Array(encryptedData);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        localStorage.setItem(`ipfs_${cid}`, base64);

        console.log('✅ Mock IPFS upload complete:', cid);

        return {
            cid,
            size: encryptedData.byteLength
        };
    } catch (error: any) {
        console.error('❌ Mock IPFS upload failed:', error);
        throw new Error(`IPFS upload failed: ${error.message}`);
    }
}

/**
 * Simulate IPFS download
 */
export async function downloadFromIPFS(cid: string): Promise<DownloadResult> {
    try {
        console.log('📥 Mock IPFS download:', cid);

        // In demo mode, data is stored in localStorage by FileUpload component
        // This is just a placeholder that returns what was stored
        throw new Error('Download from IPFS: Use stored encryption keys from localStorage');
    } catch (error: any) {
        console.error('❌ Mock IPFS download failed:', error);
        throw error;
    }
}

/**
 * Generate a mock Content Identifier (CID)
 */
function generateMockCID(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let cid = 'Qm'; // IPFS CIDs typically start with Qm

    for (let i = 0; i < 44; i++) {
        cid += chars[Math.floor(Math.random() * chars.length)];
    }

    return cid;
}

/**
 * Helper: delay function
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Pin to Crust Network (mock)
 */
export async function pinToCrust(cid: string): Promise<boolean> {
    console.log('📌 Mock Crust pinning:', cid);
    return true;
}

/**
 * Get IPFS client (mock - not used in demo mode)
 */
export function getIPFSClient(): any {
    console.warn('Using mock IPFS client - no real IPFS connection');
    return null;
}

/**
 * Retrieve data from IPFS by CID (mock)
 */
export async function getFromIPFS(cid: string): Promise<ArrayBuffer> {
    try {
        // In mock mode, try to get from localStorage
        const stored = localStorage.getItem(`ipfs_${cid}`);
        if (stored) {
            // Convert base64 back to ArrayBuffer
            const binary = atob(stored);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return bytes.buffer;
        }

        // If not in localStorage, simulate network fetch
        console.log('🌐 Mock IPFS fetch:', cid);
        await delay(500); // Simulate network delay

        throw new Error('CID not found in local storage. In production, this would fetch from IPFS network.');
    } catch (error: any) {
        throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
    }
}
