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
 * Register a file shared with a wallet address
 */
export function registerSharedFile(recipientWallet: string, fileMetadata: any): void {
    try {
        const sharedFilesKey = `shared_files_${recipientWallet}`;
        const existing = localStorage.getItem(sharedFilesKey);
        const sharedFiles = existing ? JSON.parse(existing) : [];
        
        // Check if file already shared (avoid duplicates)
        const exists = sharedFiles.some((f: any) => f.cid === fileMetadata.cid && f.sharedBy === fileMetadata.sharedBy);
        if (!exists) {
            sharedFiles.push(fileMetadata);
            localStorage.setItem(sharedFilesKey, JSON.stringify(sharedFiles));
            console.log(`📤 Registered shared file ${fileMetadata.cid} for ${recipientWallet.slice(0, 8)}...`);
        }
    } catch (e) {
        console.warn('Failed to register shared file:', e);
    }
}

/**
 * Get all files shared with a wallet address
 */
export function getSharedFiles(walletAddress: string): any[] {
    try {
        const sharedFilesKey = `shared_files_${walletAddress}`;
        const stored = localStorage.getItem(sharedFilesKey);
        
        if (!stored) {
            return [];
        }

        const sharedFiles = JSON.parse(stored);
        
        // Filter out expired files
        const now = new Date();
        const validFiles = sharedFiles.filter((file: any) => {
            if (!file.expiresAt) return true; // Permanent access
            return new Date(file.expiresAt) > now;
        });

        // Update storage if any files were filtered
        if (validFiles.length !== sharedFiles.length) {
            localStorage.setItem(sharedFilesKey, JSON.stringify(validFiles));
        }

        return validFiles.reverse(); // Most recent first
    } catch (e) {
        console.warn('Failed to get shared files:', e);
        return [];
    }
}

/**
 * Remove a shared file (when access is revoked)
 */
export function removeSharedFile(recipientWallet: string, cid: string, sharedBy: string): void {
    try {
        const sharedFilesKey = `shared_files_${recipientWallet}`;
        const stored = localStorage.getItem(sharedFilesKey);
        
        if (!stored) return;

        const sharedFiles = JSON.parse(stored);
        const filtered = sharedFiles.filter(
            (f: any) => !(f.cid === cid && f.sharedBy === sharedBy)
        );

        localStorage.setItem(sharedFilesKey, JSON.stringify(filtered));
        console.log(`🗑️ Removed shared file ${cid} for ${recipientWallet.slice(0, 8)}...`);
    } catch (e) {
        console.warn('Failed to remove shared file:', e);
    }
}
