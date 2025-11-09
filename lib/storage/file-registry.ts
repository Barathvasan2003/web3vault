/**
 * Decentralized File Registry
 * Stores file metadata in localStorage for persistence
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

    // Persist in localStorage so files remain after logout/login
    try {
        localStorage.setItem(
            `files_${walletAddress}`,
            JSON.stringify(userFiles)
        );
    } catch (e) {
        console.warn('localStorage failed, using memory only');
    }

    console.log(`📝 Registered file ${fileMetadata.cid} for ${walletAddress.slice(0, 8)}...`);
}

/**
 * Get all files for a wallet address
 */
export function getFiles(walletAddress: string): any[] {
    // Try memory first
    let files = fileRegistry.get(walletAddress);

    // If not in memory, try localStorage (persists after logout)
    if (!files) {
        try {
            const stored = localStorage.getItem(`files_${walletAddress}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    files = parsed;
                    fileRegistry.set(walletAddress, files);
                }
            }
        } catch (e) {
            console.warn('Failed to load from localStorage');
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
        localStorage.setItem(
            `files_${walletAddress}`,
            JSON.stringify(updated)
        );
    } catch (e) {
        console.warn('localStorage update failed');
    }
}

/**
 * Clear all files for a wallet (used on logout)
 */
export function clearFiles(walletAddress: string): void {
    fileRegistry.delete(walletAddress);
    try {
        localStorage.removeItem(`files_${walletAddress}`);
    } catch (e) {
        // Ignore
    }
}

/**
 * Get shared files (placeholder for future blockchain ACL)
 */
export function getSharedFiles(walletAddress: string): any[] {
    // Query blockchain for files shared with this address
    // Also get share tokens from secure-share
    // This function is now async, so update callers if needed
    const files: any[] = [];

    // Get share tokens (local and cross-device)
    try {
        // Import dynamically to avoid circular deps
        const { getSharedWithWallet } = require('../sharing/secure-share');
        const shareTokens = getSharedWithWallet(walletAddress);
        shareTokens.forEach((token: any) => {
            files.push({
                cid: token.cid,
                fileName: token.fileName,
                encryptionKey: token.encryptionKey,
                iv: token.iv,
                sharedBy: token.sharedBy,
                sharedWith: token.sharedWith,
                createdAt: token.createdAt,
                fromShareToken: true
            });
        });
    } catch (e) {
        console.warn('Could not load share tokens:', e);
    }

    // Get files from blockchain
    try {
        const { getFilesFromBlockchain } = require('../polkadot/blockchain');
        // This is async, so callers should await this function
        // For now, just warn if not awaited
        getFilesFromBlockchain(walletAddress).then((bcFiles: any) => {
            bcFiles.forEach((bcFile: any) => {
                // Deduplicate by CID
                if (!files.some(f => f.cid === bcFile.cid)) {
                    files.push(bcFile);
                }
            });
        });
    } catch (e) {
        console.warn('Could not load blockchain files:', e);
    }

    // Also check localStorage for shared files
    try {
        const stored = localStorage.getItem(`shared_files_${walletAddress}`);
        if (stored) {
            const localFiles = JSON.parse(stored);
            localFiles.forEach(lf => {
                if (!files.some(f => f.cid === lf.cid)) {
                    files.push(lf);
                }
            });
        }
    } catch (e) {
        // Ignore localStorage errors
    }

    return files;
}
