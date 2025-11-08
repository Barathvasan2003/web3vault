/**
 * Simple & Secure File Sharing System
 * Generates share links with CID + Encryption Key + IV
 * 
 * Share Link Format:
 * https://yourapp.com/view?cid=XXX&key=YYY&iv=ZZZ
 */

export interface ShareLinkData {
    cid: string;
    encryptionKey: string;
    iv: number[];
    fileName?: string;
    fileType?: string;
}

/**
 * Generate a shareable link with encryption parameters
 * Anyone with this link can view the file
 */
export function generateShareLink(
    cid: string,
    encryptionKey: string,
    iv: number[],
    fileName?: string,
    fileType?: string
): string {
    // Get base URL (current domain)
    const baseUrl = typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://localhost:3000';

    // Create URL with parameters
    const params = new URLSearchParams();
    params.set('cid', cid);
    params.set('key', encryptionKey);
    params.set('iv', JSON.stringify(iv));

    if (fileName) params.set('fileName', fileName);
    if (fileType) params.set('fileType', fileType);

    const shareLink = `${baseUrl}/view?${params.toString()}`;

    console.log('🔗 Share link generated:');
    console.log('   CID:', cid);
    console.log('   Link:', shareLink);

    return shareLink;
}

/**
 * Parse share link to extract file data
 */
export function parseShareLink(url: string): ShareLinkData | null {
    try {
        const urlObj = new URL(url);
        const params = urlObj.searchParams;

        const cid = params.get('cid');
        const key = params.get('key');
        const ivStr = params.get('iv');

        if (!cid || !key || !ivStr) {
            return null;
        }

        const iv = JSON.parse(ivStr);

        return {
            cid,
            encryptionKey: key,
            iv,
            fileName: params.get('fileName') || undefined,
            fileType: params.get('fileType') || undefined,
        };
    } catch (error) {
        console.error('Failed to parse share link:', error);
        return null;
    }
}

/**
 * Copy share link to clipboard
 */
export async function copyShareLink(shareLink: string): Promise<boolean> {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareLink);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareLink;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    } catch (error) {
        console.error('Failed to copy link:', error);
        return false;
    }
}

/**
 * Generate QR code data URL for sharing
 */
export async function generateQRCode(shareLink: string): Promise<string> {
    try {
        // Use QRCode library if available
        if (typeof window !== 'undefined' && (window as any).QRCode) {
            const QRCode = (window as any).QRCode;
            const qr = new QRCode.QRCodeSVG(shareLink, {
                width: 256,
                height: 256,
            });
            return qr.svg();
        }

        // Fallback: use an API
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(shareLink)}`;
        return apiUrl;
    } catch (error) {
        console.error('Failed to generate QR code:', error);
        return '';
    }
}

/**
 * Create temporary share link (stored in localStorage with expiry)
 */
export function createTemporaryShare(
    cid: string,
    encryptionKey: string,
    iv: number[],
    expiresInHours: number = 24
): string {
    const shareId = generateShareId();
    const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);

    const shareData = {
        cid,
        encryptionKey,
        iv,
        expiresAt,
        createdAt: Date.now(),
    };

    // Store in localStorage
    localStorage.setItem(`temp_share_${shareId}`, JSON.stringify(shareData));

    // Get base URL
    const baseUrl = typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://localhost:3000';

    return `${baseUrl}/view?share=${shareId}`;
}

/**
 * Retrieve temporary share data
 */
export function getTemporaryShare(shareId: string): ShareLinkData | null {
    try {
        const data = localStorage.getItem(`temp_share_${shareId}`);
        if (!data) return null;

        const shareData = JSON.parse(data);

        // Check if expired
        if (shareData.expiresAt < Date.now()) {
            localStorage.removeItem(`temp_share_${shareId}`);
            return null;
        }

        return {
            cid: shareData.cid,
            encryptionKey: shareData.encryptionKey,
            iv: shareData.iv,
        };
    } catch (error) {
        return null;
    }
}

/**
 * Generate random share ID
 */
function generateShareId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate share link security
 */
export function validateShareLink(shareLink: string): {
    valid: boolean;
    warnings: string[];
} {
    const warnings: string[] = [];

    // Check if HTTPS in production
    if (shareLink.startsWith('http://') && !shareLink.includes('localhost')) {
        warnings.push('⚠️ Share link uses HTTP instead of HTTPS. Encryption keys may be exposed.');
    }

    // Check if link is too long (might get truncated)
    if (shareLink.length > 2000) {
        warnings.push('⚠️ Share link is very long and might get truncated in some apps.');
    }

    return {
        valid: warnings.length === 0,
        warnings,
    };
}

/**
 * Log share event (for audit trail)
 */
export function logShareEvent(
    cid: string,
    sharedBy: string,
    sharedWith: string,
    method: 'link' | 'qr' | 'email'
): void {
    const event = {
        cid,
        sharedBy,
        sharedWith,
        method,
        timestamp: Date.now(),
    };

    // Store in localStorage
    const logs = JSON.parse(localStorage.getItem('share_logs') || '[]');
    logs.push(event);

    // Keep only last 100 logs
    if (logs.length > 100) {
        logs.shift();
    }

    localStorage.setItem('share_logs', JSON.stringify(logs));

    console.log('📤 File shared:', event);
}

/**
 * Get share logs
 */
export function getShareLogs(): any[] {
    return JSON.parse(localStorage.getItem('share_logs') || '[]');
}

/**
 * Revoke share (for temporary shares)
 */
export function revokeShare(shareId: string): boolean {
    try {
        localStorage.removeItem(`temp_share_${shareId}`);
        console.log('✅ Share revoked:', shareId);
        return true;
    } catch (error) {
        console.error('Failed to revoke share:', error);
        return false;
    }
}
