/**
 * Access Token System for Time-Limited File Sharing
 * Supports: One-time view, 24-hour access, custom date range
 */

export type ShareType = 'one-time' | '24-hours' | 'custom' | 'permanent';

export interface AccessToken {
    tokenId: string;
    cid: string;
    encryptionKey: string;
    iv: number[];
    fileName: string;
    fileType: string;
    shareType: ShareType;
    createdAt: number;
    createdBy: string; // wallet address
    expiresAt?: number; // timestamp
    validFrom?: number; // for custom date range
    validUntil?: number; // for custom date range
    maxViews?: number;
    viewCount: number;
    isActive: boolean;
}

/**
 * Generate unique token ID
 */
export function generateTokenId(cid: string, createdBy: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${cid.slice(0, 8)}_${timestamp}_${random}`;
}

/**
 * Create access token based on share type
 */
export function createAccessToken(
    cid: string,
    encryptionKey: string,
    iv: number[],
    fileName: string,
    fileType: string,
    shareType: ShareType,
    createdBy: string,
    options?: {
        validFrom?: number;
        validUntil?: number;
        customDays?: number;
    }
): AccessToken {
    const now = Date.now();
    const tokenId = generateTokenId(cid, createdBy);

    const token: AccessToken = {
        tokenId,
        cid,
        encryptionKey,
        iv,
        fileName,
        fileType,
        shareType,
        createdAt: now,
        createdBy,
        viewCount: 0,
        isActive: true,
    };

    // Configure based on share type
    switch (shareType) {
        case 'one-time':
            token.maxViews = 1;
            token.expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days max (in case not viewed)
            break;

        case '24-hours':
            token.expiresAt = now + 24 * 60 * 60 * 1000;
            break;

        case 'custom':
            if (options?.validFrom && options?.validUntil) {
                token.validFrom = options.validFrom;
                token.validUntil = options.validUntil;
            } else if (options?.customDays) {
                token.validFrom = now;
                token.validUntil = now + options.customDays * 24 * 60 * 60 * 1000;
            } else {
                // Default to 7 days if no custom range provided
                token.validFrom = now;
                token.validUntil = now + 7 * 24 * 60 * 60 * 1000;
            }
            break;

        case 'permanent':
            // No expiry, unlimited views
            break;
    }

    return token;
}

/**
 * Store access token (localStorage + optionally blockchain)
 */
export function storeAccessToken(token: AccessToken): void {
    try {
        // Get existing tokens
        const stored = localStorage.getItem('access_tokens');
        const tokens: AccessToken[] = stored ? JSON.parse(stored) : [];

        // Add new token
        tokens.push(token);

        // Store back
        localStorage.setItem('access_tokens', JSON.stringify(tokens));

        console.log('✅ Access token stored:', token.tokenId);
        console.log('   Type:', token.shareType);
        console.log('   Expires:', token.expiresAt ? new Date(token.expiresAt).toLocaleString() : 'Never');
    } catch (error) {
        console.error('❌ Failed to store access token:', error);
        throw new Error('Failed to store access token');
    }
}

/**
 * Retrieve access token by ID
 */
export function getAccessToken(tokenId: string): AccessToken | null {
    try {
        const stored = localStorage.getItem('access_tokens');
        if (!stored) return null;

        const tokens: AccessToken[] = JSON.parse(stored);
        return tokens.find(t => t.tokenId === tokenId) || null;
    } catch (error) {
        console.error('❌ Failed to retrieve access token:', error);
        return null;
    }
}

/**
 * Validate access token and check if it can be used
 */
export function validateAccessToken(tokenId: string): {
    valid: boolean;
    token?: AccessToken;
    reason?: string;
} {
    const token = getAccessToken(tokenId);

    if (!token) {
        return {
            valid: false,
            reason: 'Invalid or expired access token',
        };
    }

    if (!token.isActive) {
        return {
            valid: false,
            reason: 'This access link has been revoked',
        };
    }

    const now = Date.now();

    // Check one-time view limit
    if (token.maxViews && token.viewCount >= token.maxViews) {
        return {
            valid: false,
            reason: 'This link was for one-time access only and has already been used',
        };
    }

    // Check expiry (for one-time and 24-hour)
    if (token.expiresAt && now > token.expiresAt) {
        return {
            valid: false,
            reason: `This access link expired on ${new Date(token.expiresAt).toLocaleString()}`,
        };
    }

    // Check custom date range
    if (token.validFrom && now < token.validFrom) {
        return {
            valid: false,
            reason: `This link will be valid from ${new Date(token.validFrom).toLocaleString()}`,
        };
    }

    if (token.validUntil && now > token.validUntil) {
        return {
            valid: false,
            reason: `This link expired on ${new Date(token.validUntil).toLocaleString()}`,
        };
    }

    // Token is valid!
    return {
        valid: true,
        token,
    };
}

/**
 * Increment view count for token (burns one-time tokens)
 */
export function incrementViewCount(tokenId: string): void {
    try {
        const stored = localStorage.getItem('access_tokens');
        if (!stored) return;

        const tokens: AccessToken[] = JSON.parse(stored);
        const token = tokens.find(t => t.tokenId === tokenId);

        if (!token) return;

        // Increment view count
        token.viewCount++;

        // Burn one-time tokens after first view
        if (token.maxViews && token.viewCount >= token.maxViews) {
            token.isActive = false;
            console.log('🔥 One-time token burned:', tokenId);
        }

        // Save back
        localStorage.setItem('access_tokens', JSON.stringify(tokens));

        console.log('📊 Token view count:', token.viewCount);
    } catch (error) {
        console.error('❌ Failed to increment view count:', error);
    }
}

/**
 * Revoke access token (deactivate)
 */
export function revokeAccessToken(tokenId: string): void {
    try {
        const stored = localStorage.getItem('access_tokens');
        if (!stored) return;

        const tokens: AccessToken[] = JSON.parse(stored);
        const token = tokens.find(t => t.tokenId === tokenId);

        if (token) {
            token.isActive = false;
            localStorage.setItem('access_tokens', JSON.stringify(tokens));
            console.log('🚫 Token revoked:', tokenId);
        }
    } catch (error) {
        console.error('❌ Failed to revoke token:', error);
    }
}

/**
 * Get all tokens created by a user
 */
export function getUserTokens(walletAddress: string): AccessToken[] {
    try {
        const stored = localStorage.getItem('access_tokens');
        if (!stored) return [];

        const tokens: AccessToken[] = JSON.parse(stored);
        return tokens.filter(t => t.createdBy === walletAddress);
    } catch (error) {
        console.error('❌ Failed to get user tokens:', error);
        return [];
    }
}

/**
 * Clean up expired tokens (housekeeping)
 */
export function cleanupExpiredTokens(): void {
    try {
        const stored = localStorage.getItem('access_tokens');
        if (!stored) return;

        const tokens: AccessToken[] = JSON.parse(stored);
        const now = Date.now();

        // Filter out expired tokens
        const activeTokens = tokens.filter(token => {
            // Keep if permanent
            if (token.shareType === 'permanent') return true;

            // Remove if expired
            if (token.expiresAt && now > token.expiresAt) return false;
            if (token.validUntil && now > token.validUntil) return false;

            // Remove if one-time and already used
            if (token.maxViews && token.viewCount >= token.maxViews) return false;

            return true;
        });

        localStorage.setItem('access_tokens', JSON.stringify(activeTokens));
        console.log(`🧹 Cleaned up ${tokens.length - activeTokens.length} expired tokens`);
    } catch (error) {
        console.error('❌ Failed to cleanup tokens:', error);
    }
}

/**
 * Generate shareable link with token
 */
export function generateTokenLink(tokenId: string): string {
    const baseUrl = typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://localhost:3000';

    return `${baseUrl}/view?token=${tokenId}`;
}
