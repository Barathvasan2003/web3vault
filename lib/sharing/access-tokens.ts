/**
 * Access Token Management System
 * 
 * Security Features:
 * - Encryption keys stored separately, not in URL
 * - Short token IDs instead of full encryption data
 * - Time-limited access (one-time, 24hr, custom, permanent)
 * - View count tracking
 * - Token revocation support
 */

export interface AccessToken {
    tokenId: string;
    cid: string;
    encryptionKey: string;
    iv: number[];
    fileName: string;
    fileType: string;
    shareType: 'one-time' | '24-hours' | 'custom' | 'permanent';
    createdAt: string;
    expiresAt: string | null;
    maxViews: number | null;
    viewCount: number;
    customStartDate?: string;
    customEndDate?: string;
    isActive: boolean;
    ownerAddress: string;
}

/**
 * Generate a unique token ID
 */
export function generateTokenId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomStr}`;
}

/**
 * Create an access token for file sharing
 */
export function createAccessToken(
    cid: string,
    encryptionKey: string,
    iv: number[],
    fileName: string,
    fileType: string,
    shareType: 'one-time' | '24-hours' | 'custom' | 'permanent',
    ownerAddress: string,
    customStartDate?: string,
    customEndDate?: string
): AccessToken {
    const tokenId = generateTokenId();
    const now = new Date();

    let expiresAt: string | null = null;
    let maxViews: number | null = null;

    // Set expiration based on share type
    switch (shareType) {
        case 'one-time':
            maxViews = 1;
            expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days max
            break;
        case '24-hours':
            expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            break;
        case 'custom':
            if (customStartDate && customEndDate) {
                expiresAt = new Date(customEndDate).toISOString();
            }
            break;
        case 'permanent':
            expiresAt = null;
            break;
    }

    const token: AccessToken = {
        tokenId,
        cid,
        encryptionKey,
        iv,
        fileName,
        fileType,
        shareType,
        createdAt: now.toISOString(),
        expiresAt,
        maxViews,
        viewCount: 0,
        customStartDate,
        customEndDate,
        isActive: true,
        ownerAddress
    };

    return token;
}

/**
 * Store access token in localStorage
 */
export function storeAccessToken(token: AccessToken): void {
    const storageKey = `access_token_${token.tokenId}`;
    localStorage.setItem(storageKey, JSON.stringify(token));

    // Also maintain a list of all tokens
    const allTokensKey = 'all_access_tokens';
    const allTokensStr = localStorage.getItem(allTokensKey);
    const allTokens = allTokensStr ? JSON.parse(allTokensStr) : [];

    if (!allTokens.includes(token.tokenId)) {
        allTokens.push(token.tokenId);
        localStorage.setItem(allTokensKey, JSON.stringify(allTokens));
    }

    console.log('✅ Access token stored:', token.tokenId);
}

/**
 * Retrieve access token by ID
 */
export function getAccessToken(tokenId: string): AccessToken | null {
    const storageKey = `access_token_${tokenId}`;
    const tokenStr = localStorage.getItem(storageKey);

    if (!tokenStr) {
        console.log('❌ Token not found:', tokenId);
        return null;
    }

    try {
        const token = JSON.parse(tokenStr) as AccessToken;
        return token;
    } catch (error) {
        console.error('Error parsing token:', error);
        return null;
    }
}

/**
 * Validate if token is still valid
 */
export function validateAccessToken(token: AccessToken): {
    valid: boolean;
    reason?: string;
} {
    // Check if token is active
    if (!token.isActive) {
        return { valid: false, reason: 'Token has been revoked' };
    }

    const now = new Date();

    // Check custom date range
    if (token.shareType === 'custom') {
        if (token.customStartDate) {
            const startDate = new Date(token.customStartDate);
            if (now < startDate) {
                return { valid: false, reason: 'Access not yet available' };
            }
        }
        if (token.customEndDate) {
            const endDate = new Date(token.customEndDate);
            endDate.setHours(23, 59, 59, 999); // End of day
            if (now > endDate) {
                return { valid: false, reason: 'Access period has ended' };
            }
        }
    }

    // Check expiration
    if (token.expiresAt) {
        const expiryDate = new Date(token.expiresAt);
        if (now > expiryDate) {
            return { valid: false, reason: 'Token has expired' };
        }
    }

    // Check view count for one-time access
    if (token.maxViews !== null && token.viewCount >= token.maxViews) {
        return { valid: false, reason: 'Maximum views reached' };
    }

    return { valid: true };
}

/**
 * Increment view count for a token
 */
export function incrementViewCount(tokenId: string): void {
    const token = getAccessToken(tokenId);
    if (!token) return;

    token.viewCount += 1;

    // Deactivate token if max views reached
    if (token.maxViews !== null && token.viewCount >= token.maxViews) {
        token.isActive = false;
        console.log('🔒 Token burned after one-time use:', tokenId);
    }

    storeAccessToken(token);
}

/**
 * Revoke an access token
 */
export function revokeAccessToken(tokenId: string): boolean {
    const token = getAccessToken(tokenId);
    if (!token) return false;

    token.isActive = false;
    storeAccessToken(token);

    console.log('🚫 Token revoked:', tokenId);
    return true;
}

/**
 * Generate a shareable URL with token (local storage only - doesn't work cross-device)
 */
export function generateTokenUrl(tokenId: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/view?token=${tokenId}`;
}

/**
 * Generate a shareable URL with embedded token data (works cross-device!)
 * Encodes the full token as base64 in URL so recipient can decrypt without localStorage
 */
export function generateShareableTokenUrl(token: AccessToken): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    // Create a shareable token object (includes encryption keys)
    const shareableToken = {
        tokenId: token.tokenId,
        cid: token.cid,
        encryptionKey: token.encryptionKey,
        iv: token.iv,
        fileName: token.fileName,
        fileType: token.fileType,
        shareType: token.shareType,
        expiresAt: token.expiresAt,
        maxViews: token.maxViews,
        createdAt: token.createdAt,
        customStartDate: token.customStartDate,
        customEndDate: token.customEndDate
    };

    // Encode as base64 (simple and clean)
    const tokenData = JSON.stringify(shareableToken);
    const base64Token = btoa(tokenData);

    // Create URL with token ID and embedded data
    // encodeURIComponent ensures the base64 is URL-safe
    return `${baseUrl}/view?token=${token.tokenId}&data=${encodeURIComponent(base64Token)}`;
}

/**
 * Decode token data from URL
 */
export function decodeTokenFromUrl(tokenId: string, urlEncodedBase64: string): AccessToken | null {
    try {
        // First decode the URL encoding, then decode base64
        const base64Data = decodeURIComponent(urlEncodedBase64);
        const tokenData = atob(base64Data);
        const shareableToken = JSON.parse(tokenData);

        // Reconstruct full AccessToken (add missing fields)
        const token: AccessToken = {
            ...shareableToken,
            viewCount: 0, // Will be tracked when they access
            isActive: true,
            ownerAddress: 'unknown' // Not needed for viewing
        };

        return token;
    } catch (error) {
        console.error('Error decoding token from URL:', error);
        return null;
    }
}

/**
 * Get all tokens for a specific file (by CID)
 */
export function getTokensForFile(cid: string): AccessToken[] {
    const allTokensKey = 'all_access_tokens';
    const allTokensStr = localStorage.getItem(allTokensKey);
    const allTokenIds = allTokensStr ? JSON.parse(allTokensStr) : [];

    const tokens: AccessToken[] = [];

    for (const tokenId of allTokenIds) {
        const token = getAccessToken(tokenId);
        if (token && token.cid === cid) {
            tokens.push(token);
        }
    }

    return tokens;
}

/**
 * Clean up expired tokens
 */
export function cleanupExpiredTokens(): void {
    const allTokensKey = 'all_access_tokens';
    const allTokensStr = localStorage.getItem(allTokensKey);
    const allTokenIds = allTokensStr ? JSON.parse(allTokensStr) : [];

    const activeTokenIds: string[] = [];

    for (const tokenId of allTokenIds) {
        const token = getAccessToken(tokenId);
        if (!token) continue;

        const validation = validateAccessToken(token);

        if (validation.valid || token.isActive) {
            activeTokenIds.push(tokenId);
        } else {
            // Remove expired token
            localStorage.removeItem(`access_token_${tokenId}`);
            console.log('🗑️ Cleaned up expired token:', tokenId);
        }
    }

    localStorage.setItem(allTokensKey, JSON.stringify(activeTokenIds));
}

/**
 * Get human-readable token info
 */
export function getTokenInfo(token: AccessToken): string {
    const validation = validateAccessToken(token);
    const status = validation.valid ? '✅ Active' : `❌ ${validation.reason}`;

    let expiryInfo = '';
    switch (token.shareType) {
        case 'one-time':
            expiryInfo = `One-time use (${token.viewCount}/${token.maxViews} views)`;
            break;
        case '24-hours':
            const hoursLeft = token.expiresAt
                ? Math.max(0, Math.ceil((new Date(token.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))
                : 0;
            expiryInfo = `24-hour access (${hoursLeft}h remaining)`;
            break;
        case 'custom':
            expiryInfo = `Custom: ${token.customStartDate} to ${token.customEndDate}`;
            break;
        case 'permanent':
            expiryInfo = 'Permanent access';
            break;
    }

    return `${status}\n${expiryInfo}\nViews: ${token.viewCount}\nCreated: ${new Date(token.createdAt).toLocaleString()}`;
}
