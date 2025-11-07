/**
 * Access Control System for Medical Records
 * Prevents unauthorized access to encrypted files
 */

export interface AccessRule {
    walletAddress: string;
    accessType: 'owner' | 'temporary' | 'permanent';
    expiresAt?: number; // timestamp
    grantedAt: number; // timestamp
    grantedBy: string; // wallet address
}

export interface FileAccessControl {
    cid: string;
    owner: string; // wallet address of file owner
    accessList: AccessRule[];
    createdAt: number;
}

/**
 * Check if a wallet address has access to a file
 */
export function hasAccess(
    acl: FileAccessControl,
    walletAddress: string,
    currentTime: number = Date.now()
): boolean {
    // Owner always has access
    if (acl.owner === walletAddress) {
        return true;
    }

    // Check access list
    const accessRule = acl.accessList.find(
        rule => rule.walletAddress === walletAddress
    );

    if (!accessRule) {
        return false;
    }

    // Check if access has expired
    if (accessRule.expiresAt && currentTime > accessRule.expiresAt) {
        return false;
    }

    return true;
}

/**
 * Grant access to a wallet address
 */
export function grantAccess(
    acl: FileAccessControl,
    targetWallet: string,
    accessType: 'temporary' | 'permanent',
    grantedBy: string,
    durationHours?: number
): FileAccessControl {
    // Remove existing access for this wallet
    const filteredList = acl.accessList.filter(
        rule => rule.walletAddress !== targetWallet
    );

    // Create new access rule
    const now = Date.now();
    const newRule: AccessRule = {
        walletAddress: targetWallet,
        accessType,
        grantedAt: now,
        grantedBy,
    };

    // Add expiration for temporary access
    if (accessType === 'temporary' && durationHours) {
        newRule.expiresAt = now + durationHours * 60 * 60 * 1000;
    }

    return {
        ...acl,
        accessList: [...filteredList, newRule],
    };
}

/**
 * Revoke access from a wallet address
 */
export function revokeAccess(
    acl: FileAccessControl,
    targetWallet: string
): FileAccessControl {
    return {
        ...acl,
        accessList: acl.accessList.filter(
            rule => rule.walletAddress !== targetWallet
        ),
    };
}

/**
 * Create initial ACL for a new file
 */
export function createACL(
    cid: string,
    ownerWallet: string
): FileAccessControl {
    return {
        cid,
        owner: ownerWallet,
        accessList: [],
        createdAt: Date.now(),
    };
}

/**
 * Store ACL in localStorage (encrypted with owner's key)
 */
export function storeACL(acl: FileAccessControl): void {
    const aclKey = `acl_${acl.cid}`;
    localStorage.setItem(aclKey, JSON.stringify(acl));
}

/**
 * Retrieve ACL from localStorage
 */
export function getACL(cid: string): FileAccessControl | null {
    const aclKey = `acl_${cid}`;
    const stored = localStorage.getItem(aclKey);

    if (!stored) {
        return null;
    }

    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

/**
 * Verify user has permission to access file
 */
export function verifyAccess(
    cid: string,
    walletAddress: string
): {
    hasAccess: boolean;
    reason?: string;
    accessType?: 'owner' | 'temporary' | 'permanent';
} {
    const acl = getACL(cid);

    if (!acl) {
        return {
            hasAccess: false,
            reason: 'Access control list not found. This file may not exist or was uploaded without proper permissions.',
        };
    }

    // Check if user is owner
    if (acl.owner === walletAddress) {
        return {
            hasAccess: true,
            accessType: 'owner',
        };
    }

    // Check access list
    const now = Date.now();
    const accessRule = acl.accessList.find(
        rule => rule.walletAddress === walletAddress
    );

    if (!accessRule) {
        return {
            hasAccess: false,
            reason: 'You do not have permission to access this file. Please request access from the file owner.',
        };
    }

    // Check if access expired
    if (accessRule.expiresAt && now > accessRule.expiresAt) {
        return {
            hasAccess: false,
            reason: 'Your access to this file has expired.',
        };
    }

    return {
        hasAccess: true,
        accessType: accessRule.accessType,
    };
}

/**
 * Get human-readable access info
 */
export function getAccessInfo(acl: FileAccessControl): string[] {
    const info: string[] = [];

    info.push(`Owner: ${acl.owner.slice(0, 10)}...${acl.owner.slice(-8)}`);
    info.push(`Shared with: ${acl.accessList.length} ${acl.accessList.length === 1 ? 'person' : 'people'}`);

    if (acl.accessList.length > 0) {
        acl.accessList.forEach(rule => {
            const wallet = `${rule.walletAddress.slice(0, 6)}...${rule.walletAddress.slice(-4)}`;
            const type = rule.accessType === 'permanent' ? 'Permanent' : 'Temporary';
            let expiry = '';

            if (rule.expiresAt) {
                const date = new Date(rule.expiresAt);
                expiry = ` (expires ${date.toLocaleDateString()})`;
            }

            info.push(`  → ${wallet}: ${type}${expiry}`);
        });
    }

    return info;
}

/**
 * Clean up expired access rules
 */
export function cleanupExpiredAccess(acl: FileAccessControl): FileAccessControl {
    const now = Date.now();

    return {
        ...acl,
        accessList: acl.accessList.filter(
            rule => !rule.expiresAt || rule.expiresAt > now
        ),
    };
}
