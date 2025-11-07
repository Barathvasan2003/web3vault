/**
 * Decentralized File Registry
 * Stores file metadata temporarily in session
 * Future: Will be replaced with blockchain smart contract storage
 */

// In-memory file registry (temporary until blockchain integration)
let fileRegistry: Map<string, any[]> = new Map();

/**
 * Add file metadata to registry
 */
export function registerFile(walletAddress: string, fileMetadata: any): void {
    const userFiles = fileRegistry.get(walletAddress) || [];
    userFiles.push(fileMetadata);
    fileRegistry.set(walletAddress, userFiles);

    // Also persist in sessionStorage for page refreshes
    try {
        sessionStorage.setItem(
            `files_${walletAddress}`,
            JSON.stringify(userFiles)
        );
    } catch (e) {
        console.warn('Session storage failed, using memory only');
    }

    console.log(`📝 Registered file ${fileMetadata.cid} for ${walletAddress.slice(0, 8)}...`);
}

/**
 * Get all files for a wallet address
 */
export function getFiles(walletAddress: string): any[] {
    // Try memory first
    let files = fileRegistry.get(walletAddress);

    // If not in memory, try sessionStorage
    if (!files) {
        try {
            const stored = sessionStorage.getItem(`files_${walletAddress}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    files = parsed;
                    fileRegistry.set(walletAddress, files);
                }
            }
        } catch (e) {
            console.warn('Failed to load from session storage');
        }
    }

    return files || [];
}

/**
 * Remove file from registry
 */
export function removeFile(walletAddress: string, cid: string): void {
    const files = getFiles(walletAddress);
    const updated = files.filter(f => f.cid !== cid);

    fileRegistry.set(walletAddress, updated);

    try {
        sessionStorage.setItem(
            `files_${walletAddress}`,
            JSON.stringify(updated)
        );
    } catch (e) {
        console.warn('Session storage update failed');
    }
}

/**
 * Clear all files for a wallet (used on logout)
 */
export function clearFiles(walletAddress: string): void {
    fileRegistry.delete(walletAddress);
    try {
        sessionStorage.removeItem(`files_${walletAddress}`);
    } catch (e) {
        // Ignore
    }
}

/**
 * Get shared files (placeholder for future blockchain ACL)
 */
export function getSharedFiles(walletAddress: string): any[] {
    // TODO: Query blockchain for files shared with this address
    // For now, return empty array
    return [];
}
