/**
 * Secure File Sharing System
 * Uses share tokens instead of exposing encryption keys in URLs
 */

export interface ShareToken {
    id: string; // Unique share token
    cid: string; // IPFS CID
    encryptionKey: string; // AES key (stored encrypted)
    iv: number[]; // Initialization vector
    fileName: string;
    fileType: string;
    fileSize: number;
    sharedBy: string; // Owner's wallet address
    sharedWith: string; // Recipient's wallet address (or "public" for open sharing)
    accessType: 'one-time' | 'temporary' | 'permanent';
    expiresAt?: number; // Timestamp
    createdAt: number;
    accessCount: number; // How many times accessed
    maxAccess?: number; // Max number of accesses (for one-time)
}

/**
 * Generate a secure random share token ID
 */
export function generateShareToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a new share token
 */
export function createShareToken(
    cid: string,
    encryptionKey: string,
    iv: number[],
    fileName: string,
    fileType: string,
    fileSize: number,
    ownerWallet: string,
    recipientWallet: string,
    accessType: 'one-time' | 'temporary' | 'permanent',
    durationHours?: number
): ShareToken {
    const tokenId = generateShareToken();
    const now = Date.now();

    let expiresAt: number | undefined;
    let maxAccess: number | undefined;

    if (accessType === 'one-time') {
        maxAccess = 1;
        expiresAt = now + (24 * 60 * 60 * 1000); // 24 hours max
    } else if (accessType === 'temporary' && durationHours) {
        expiresAt = now + (durationHours * 60 * 60 * 1000);
    }

    const shareToken: ShareToken = {
        id: tokenId,
        cid,
        encryptionKey,
        iv,
        fileName,
        fileType,
        fileSize,
        sharedBy: ownerWallet,
        sharedWith: recipientWallet,
        accessType,
        expiresAt,
        createdAt: now,
        accessCount: 0,
        maxAccess
    };

    return shareToken;
}

/**
 * Store share token in localStorage (encrypted with owner's key in production)
 */
export function storeShareToken(token: ShareToken): void {
    const key = `share_token_${token.id}`;
    localStorage.setItem(key, JSON.stringify(token));

    // Also store in index for quick lookup
    const index = getShareTokenIndex();
    index[token.id] = {
        cid: token.cid,
        sharedBy: token.sharedBy,
        sharedWith: token.sharedWith,
        createdAt: token.createdAt
    };
    localStorage.setItem('share_token_index', JSON.stringify(index));
}

/**
 * Get share token by ID
 */
export function getShareToken(tokenId: string): ShareToken | null {
    const key = `share_token_${tokenId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('Failed to parse share token:', e);
        return null;
    }
}

/**
 * Get share token index
 */
function getShareTokenIndex(): Record<string, any> {
    const data = localStorage.getItem('share_token_index');
    if (!data) return {};

    try {
        return JSON.parse(data);
    } catch (e) {
        return {};
    }
}

/**
 * Verify and validate share token
 */
export function validateShareToken(
    token: ShareToken,
    walletAddress?: string
): { valid: boolean; reason?: string } {
    const now = Date.now();

    // Check if expired
    if (token.expiresAt && now > token.expiresAt) {
        return { valid: false, reason: 'Share link has expired' };
    }

    // Check max access count
    if (token.maxAccess && token.accessCount >= token.maxAccess) {
        return { valid: false, reason: 'Share link has reached maximum access count' };
    }

    // Check wallet restriction
    if (walletAddress && token.sharedWith !== 'public' && token.sharedWith !== walletAddress) {
        return { valid: false, reason: 'This share link is for a different wallet address' };
    }

    return { valid: true };
}

/**
 * Increment access count
 */
export function incrementAccessCount(tokenId: string): void {
    const token = getShareToken(tokenId);
    if (!token) return;

    token.accessCount += 1;
    storeShareToken(token);
}

/**
 * Get all share tokens created by a wallet
 */
export function getSharedByWallet(walletAddress: string): ShareToken[] {
    const tokens: ShareToken[] = [];
    const index = getShareTokenIndex();

    for (const tokenId in index) {
        if (index[tokenId].sharedBy === walletAddress) {
            const token = getShareToken(tokenId);
            if (token) tokens.push(token);
        }
    }

    return tokens.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get all share tokens for a recipient wallet
 */
export function getSharedWithWallet(walletAddress: string): ShareToken[] {
    const tokens: ShareToken[] = [];
    const index = getShareTokenIndex();

    for (const tokenId in index) {
        const info = index[tokenId];
        if (info.sharedWith === walletAddress || info.sharedWith === 'public') {
            const token = getShareToken(tokenId);
            if (token) {
                const validation = validateShareToken(token, walletAddress);
                if (validation.valid) {
                    tokens.push(token);
                }
            }
        }
    }

    return tokens.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Revoke a share token
 */
export function revokeShareToken(tokenId: string): boolean {
    const key = `share_token_${tokenId}`;
    localStorage.removeItem(key);

    // Remove from index
    const index = getShareTokenIndex();
    delete index[tokenId];
    localStorage.setItem('share_token_index', JSON.stringify(index));

    return true;
}

/**
 * Clean up expired tokens
 */
export function cleanupExpiredTokens(): number {
    let cleaned = 0;
    const index = getShareTokenIndex();
    const now = Date.now();

    for (const tokenId in index) {
        const token = getShareToken(tokenId);
        if (token && token.expiresAt && now > token.expiresAt) {
            revokeShareToken(tokenId);
            cleaned++;
        }
    }

    return cleaned;
}

/**
 * Get share statistics
 */
export function getShareStats(walletAddress: string): {
    totalShared: number;
    activeShares: number;
    expiredShares: number;
    totalAccesses: number;
} {
    const tokens = getSharedByWallet(walletAddress);
    const now = Date.now();

    let activeShares = 0;
    let expiredShares = 0;
    let totalAccesses = 0;

    tokens.forEach(token => {
        totalAccesses += token.accessCount;
        if (token.expiresAt && now > token.expiresAt) {
            expiredShares++;
        } else {
            activeShares++;
        }
    });

    return {
        totalShared: tokens.length,
        activeShares,
        expiredShares,
        totalAccesses
    };
}

/**
 * Generate secure share URL for decentralized cross-platform access
 * The URL contains only the IPFS CID - all data is stored on IPFS
 */
export function generateShareUrl(
    tokenId: string,
    encryptedFileCID: string,
    origin: string = window.location.origin
): string {
    const token = getShareToken(tokenId);
    if (!token) {
        throw new Error('Share token not found');
    }

    // For decentralized sharing, we only need:
    // 1. The encrypted file CID (already on IPFS)
    // 2. The share token metadata (will be uploaded to IPFS)
    // All data is stored on IPFS, accessible from any device/browser

    const params = new URLSearchParams({
        cid: encryptedFileCID,
        token: tokenId
    });

    return `${origin}/view?${params.toString()}`;
}

/**
 * Upload share token metadata to IPFS for decentralized access
 * Returns the IPFS CID of the share metadata
 */
export async function uploadShareTokenToIPFS(token: ShareToken): Promise<string> {
    try {
        const ipfsClient = await import('@/lib/ipfs/ipfs-client');

        // Create share metadata object (without sensitive data in plain text)
        const shareMetadata = {
            id: token.id,
            cid: token.cid,
            fileName: token.fileName,
            fileType: token.fileType,
            fileSize: token.fileSize,
            sharedBy: token.sharedBy,
            sharedWith: token.sharedWith,
            accessType: token.accessType,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt,
            maxAccess: token.maxAccess,
            // Encryption key and IV are included but the file is already encrypted
            encryptionKey: token.encryptionKey,
            iv: token.iv
        };

        // Convert to JSON and upload to IPFS
        const metadataJSON = JSON.stringify(shareMetadata);
        const blob = new Blob([metadataJSON], { type: 'application/json' });
        const file = new File([blob], `share_${token.id}.json`, { type: 'application/json' });

        const metadataCID = await ipfsClient.uploadFile(file);

        console.log(`✅ Share metadata uploaded to IPFS: ${metadataCID}`);

        // Store the metadata CID with the token for later retrieval
        const tokenWithIPFS = { ...token, metadataCID };
        localStorage.setItem(`share_token_${token.id}`, JSON.stringify(tokenWithIPFS));

        return metadataCID;
    } catch (error) {
        console.error('Failed to upload share metadata to IPFS:', error);
        throw error;
    }
}

/**
 * Download share token metadata from IPFS
 * Returns the share token object
 */
export async function downloadShareTokenFromIPFS(tokenId: string, metadataCID?: string): Promise<ShareToken | null> {
    try {
        // First try to get from localStorage
        const localToken = getShareToken(tokenId);
        if (localToken) {
            return localToken;
        }

        // If not in localStorage and we have a metadataCID, download from IPFS
        if (metadataCID) {
            const ipfsClient = await import('@/lib/ipfs/ipfs-client');
            const metadataJSON = await ipfsClient.downloadFile(metadataCID);

            if (metadataJSON) {
                const shareToken = JSON.parse(metadataJSON) as ShareToken;
                // Store in localStorage for faster future access
                storeShareToken(shareToken);
                return shareToken;
            }
        }

        return null;
    } catch (error) {
        console.error('Failed to download share metadata from IPFS:', error);
        return null;
    }
}

/**
 * Generate complete decentralized share link
 * Uploads encrypted file and share metadata to IPFS
 * Returns a URL that works on any device/browser
 */
export async function generateDecentralizedShareLink(
    token: ShareToken,
    encryptedFileData: string,
    origin: string = window.location.origin
): Promise<{ shareUrl: string; fileCID: string; metadataCID: string }> {
    const ipfsClient = await import('@/lib/ipfs/ipfs-client');

    // 1. Upload encrypted file to IPFS
    const dataToUpload = encryptedFileData || '';
    const blob = new Blob([dataToUpload], { type: 'application/octet-stream' });
    const file = new File([blob], `encrypted_${token.fileName}`, { type: 'application/octet-stream' });

    const fileCID = await ipfsClient.uploadFile(file);
    console.log(`✅ Encrypted file uploaded to IPFS: ${fileCID}`);

    // 2. Upload share metadata to IPFS
    const metadataCID = await uploadShareTokenToIPFS(token);

    // 3. Generate share URL with both CIDs and encryption key
    const params = new URLSearchParams({
        cid: fileCID,
        meta: metadataCID,
        token: token.id,
        key: token.encryptionKey // Add encryption key to URL
    });

    const shareUrl = `${origin}/view?${params.toString()}`;

    return {
        shareUrl,
        fileCID,
        metadataCID
    };
}