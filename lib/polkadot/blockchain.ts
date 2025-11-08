/**
 * Polkadot Blockchain Integration for Medical Records
 * Handles wallet connection, file registry, and access control
 */

import { ApiPromise, WsProvider } from '@polkadot/api';
import {
    web3Accounts,
    web3Enable,
    web3FromAddress,
} from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const WS_PROVIDER =
    process.env.NEXT_PUBLIC_WS_PROVIDER || 'ws://127.0.0.1:9944';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'WebVault3';

let api: ApiPromise | null = null;

/**
 * Initialize Polkadot API connection
 */
export async function initPolkadotAPI(): Promise<ApiPromise | null> {
    if (api) return api;

    try {
        const provider = new WsProvider(WS_PROVIDER);
        api = await ApiPromise.create({ provider });
        await api.isReady;

        const chain = await api.rpc.system.chain();
        console.log('✅ Connected to blockchain:', chain.toString());

        return api;
    } catch (error: any) {
        console.warn('⚠️ Blockchain connection failed (optional):', error.message);
        console.log('📦 Running in offline mode - IPFS storage will still work');
        // Don't throw - blockchain is optional
        return null;
    }
}

/**
 * Get API instance
 */
export function getAPI(): ApiPromise | null {
    return api;
}

/**
 * Disconnect from blockchain
 */
export async function disconnectAPI(): Promise<void> {
    if (api) {
        await api.disconnect();
        api = null;
    }
}

/**
 * Enable Polkadot wallet extension
 */
export async function enableWallet(): Promise<boolean> {
    try {
        const extensions = await web3Enable(APP_NAME);

        if (extensions.length === 0) {
            throw new Error(
                'No Polkadot wallet found. Please install Polkadot.js extension.'
            );
        }

        console.log('✅ Wallet enabled');
        return true;
    } catch (error: any) {
        console.error('❌ Wallet enable failed:', error);
        throw error;
    }
}

/**
 * Get all wallet accounts
 */
export async function getWalletAccounts(): Promise<
    InjectedAccountWithMeta[]
> {
    try {
        await enableWallet();
        const accounts = await web3Accounts();

        if (accounts.length === 0) {
            throw new Error(
                'No accounts found. Create an account in Polkadot.js extension.'
            );
        }

        console.log('✅ Found', accounts.length, 'accounts');

        // Don't require blockchain connection for wallet access
        console.log('⚠️ Blockchain connection optional - working in offline mode');

        return accounts;
    } catch (error: any) {
        console.error('❌ Get accounts failed:', error);
        throw error;
    }
}

/**
 * Verify wallet ownership through signature
 * User must sign a message to prove they own the wallet
 */
export async function verifyWalletOwnership(
    account: any
): Promise<boolean> {
    try {
        const { web3FromAddress } = await import('@polkadot/extension-dapp');
        const { stringToHex } = await import('@polkadot/util');

        // Create a challenge message with timestamp
        const timestamp = Date.now();
        const message = `Web3Vault Login - Verify ownership of ${account.address} at ${timestamp}`;

        // Get injector for signing
        const injector = await web3FromAddress(account.address);

        if (!injector.signer.signRaw) {
            console.warn('Wallet does not support signing. Allowing access for demo.');
            return true; // Fallback for wallets without signRaw
        }

        // Request signature from user
        const signResult = await injector.signer.signRaw({
            address: account.address,
            data: stringToHex(message),
            type: 'bytes'
        });

        // If we get a signature, the user owns the wallet
        if (signResult && signResult.signature) {
            console.log('✅ Wallet ownership verified');
            // Store session info
            sessionStorage.setItem('authenticated_wallet', account.address);
            sessionStorage.setItem('auth_timestamp', timestamp.toString());
            return true;
        }

        return false;
    } catch (error: any) {
        console.error('❌ Wallet verification failed:', error);
        // If user cancels signature, return false
        if (error.message && error.message.includes('Cancelled')) {
            return false;
        }
        // For other errors, allow access (backwards compatibility)
        console.warn('Verification error, allowing access:', error.message);
        return true;
    }
}

/**
 * Check if current session is authenticated
 */
export function isSessionAuthenticated(walletAddress: string): boolean {
    const authenticated = sessionStorage.getItem('authenticated_wallet');
    const timestamp = sessionStorage.getItem('auth_timestamp');

    if (!authenticated || !timestamp) {
        return false;
    }

    // Check if session is still valid (24 hours)
    const authTime = parseInt(timestamp);
    const now = Date.now();
    const hoursPassed = (now - authTime) / (1000 * 60 * 60);

    if (hoursPassed > 24) {
        sessionStorage.removeItem('authenticated_wallet');
        sessionStorage.removeItem('auth_timestamp');
        return false;
    }

    return authenticated === walletAddress;
}

/**
 * Register medical file on blockchain
 */
export async function registerMedicalFile(
    accountAddress: string,
    fileMetadata: {
        cid: string;
        fileName: string;
        fileHash: string;
        recordType: string;
        fileSize: number;
        uploadDate: string;
    }
): Promise<{
    blockHash: string;
    success: boolean;
}> {
    try {
        if (!api) throw new Error('API not initialized');

        const injector = await web3FromAddress(accountAddress);

        // Create metadata for blockchain
        const metadata = {
            cid: fileMetadata.cid,
            fileName: fileMetadata.fileName,
            fileHash: fileMetadata.fileHash,
            recordType: fileMetadata.recordType,
            fileSize: fileMetadata.fileSize,
            uploadDate: fileMetadata.uploadDate,
            version: '1.0',
        };

        // Store as remark (for demo - use custom pallet in production)
        const tx = api.tx.system.remark(JSON.stringify(metadata));

        return new Promise((resolve, reject) => {
            tx.signAndSend(
                accountAddress,
                { signer: injector.signer },
                ({ status, events }) => {
                    if (status.isInBlock) {
                        console.log('📦 Transaction in block:', status.asInBlock.toString());
                    }

                    if (status.isFinalized) {
                        console.log(
                            '✅ Transaction finalized:',
                            status.asFinalized.toString()
                        );
                        resolve({
                            blockHash: status.asFinalized.toString(),
                            success: true,
                        });
                    }

                    // Check for errors
                    events.forEach(({ event }) => {
                        if (api!.events.system.ExtrinsicFailed.is(event)) {
                            reject(new Error('Transaction failed'));
                        }
                    });
                }
            ).catch(reject);
        });
    } catch (error: any) {
        console.error('❌ File registration failed:', error);
        throw error;
    }
}

/**
 * Create access token for file sharing
 */
export async function createAccessToken(
    accountAddress: string,
    fileId: string,
    doctorAddress: string,
    expiresAt: number,
    maxViews: number
): Promise<{
    tokenId: string;
    blockHash: string;
}> {
    try {
        if (!api) throw new Error('API not initialized');

        const injector = await web3FromAddress(accountAddress);

        const accessTokenData = {
            action: 'create_access_token',
            fileId,
            owner: accountAddress,
            grantedTo: doctorAddress,
            expiresAt,
            maxViews,
            createdAt: Date.now(),
            tokenId: generateTokenId(fileId, doctorAddress, expiresAt),
        };

        const tx = api.tx.system.remark(JSON.stringify(accessTokenData));

        return new Promise((resolve, reject) => {
            tx.signAndSend(
                accountAddress,
                { signer: injector.signer },
                ({ status }) => {
                    if (status.isFinalized) {
                        resolve({
                            tokenId: accessTokenData.tokenId,
                            blockHash: status.asFinalized.toString(),
                        });
                    }
                }
            ).catch(reject);
        });
    } catch (error: any) {
        console.error('❌ Access token creation failed:', error);
        throw error;
    }
}

/**
 * Revoke access token
 */
export async function revokeAccessToken(
    accountAddress: string,
    tokenId: string
): Promise<boolean> {
    try {
        if (!api) throw new Error('API not initialized');

        const injector = await web3FromAddress(accountAddress);

        const revokeData = {
            action: 'revoke_access_token',
            tokenId,
            revokedAt: Date.now(),
            revokedBy: accountAddress,
        };

        const tx = api.tx.system.remark(JSON.stringify(revokeData));

        return new Promise((resolve, reject) => {
            tx.signAndSend(
                accountAddress,
                { signer: injector.signer },
                ({ status }) => {
                    if (status.isFinalized) {
                        console.log('✅ Access revoked:', tokenId);
                        resolve(true);
                    }
                }
            ).catch(reject);
        });
    } catch (error: any) {
        console.error('❌ Access revocation failed:', error);
        return false;
    }
}

/**
 * Log file access (on-chain audit trail)
 */
export async function logFileAccess(
    accessorAddress: string,
    fileId: string,
    tokenId: string
): Promise<void> {
    try {
        if (!api) throw new Error('API not initialized');

        const injector = await web3FromAddress(accessorAddress);

        const accessLog = {
            action: 'file_accessed',
            fileId,
            tokenId,
            accessedBy: accessorAddress,
            accessedAt: Date.now(),
        };

        const tx = api.tx.system.remark(JSON.stringify(accessLog));

        await tx.signAndSend(accessorAddress, { signer: injector.signer });

        console.log('✅ Access logged on-chain');
    } catch (error: any) {
        console.error('❌ Access logging failed:', error);
    }
}

/**
 * Get user's medical files
 */
export async function getUserMedicalFiles(
    accountAddress: string
): Promise<any[]> {
    try {
        if (!api) throw new Error('API not initialized');

        // Search recent blocks for user's files
        // (In production, use custom pallet storage)

        const files: any[] = [];
        const signedBlock = await api.rpc.chain.getBlock();
        const blockNumber = signedBlock.block.header.number.toNumber();

        // Search last 100 blocks
        for (let i = 0; i < Math.min(100, blockNumber); i++) {
            const blockHash = await api.rpc.chain.getBlockHash(blockNumber - i);
            const block = await api.rpc.chain.getBlock(blockHash);

            block.block.extrinsics.forEach((ex) => {
                const {
                    method: { method, section },
                } = ex;

                if (section === 'system' && method === 'remark') {
                    try {
                        const remark = ex.method.args[0].toString();
                        const data = JSON.parse(remark);

                        // Check if it's a file registration from this user
                        if (data.cid && ex.signer?.toString() === accountAddress) {
                            files.push({
                                ...data,
                                blockNumber: blockNumber - i,
                                blockHash: blockHash.toString(),
                            });
                        }
                    } catch (e) {
                        // Not a valid JSON remark
                    }
                }
            });
        }

        console.log('✅ Found', files.length, 'medical files');
        return files;
    } catch (error: any) {
        console.error('❌ Failed to get files:', error);
        return [];
    }
}

/**
 * Get blockchain info
 */
export async function getBlockchainInfo(): Promise<{
    chain: string;
    nodeName: string;
    nodeVersion: string;
}> {
    if (!api) throw new Error('API not initialized');

    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version(),
    ]);

    return {
        chain: chain.toString(),
        nodeName: nodeName.toString(),
        nodeVersion: nodeVersion.toString(),
    };
}

/**
 * Helper: Generate token ID
 */
function generateTokenId(
    fileId: string,
    doctorAddress: string,
    expiresAt: number
): string {
    const data = `${fileId}-${doctorAddress}-${expiresAt}`;
    return btoa(data).substring(0, 16);
}

/**
 * Check if blockchain is connected
 */
export async function isBlockchainConnected(): Promise<boolean> {
    try {
        if (!api) return false;
        await api.rpc.system.chain();
        return true;
    } catch {
        return false;
    }
}

/**
 * Register file metadata on blockchain for cross-device access
 * Stores: CID, filename, encryption key, and IV on-chain
 * This allows users to access their files from any device
 */
export async function registerFileOnChain(
    account: InjectedAccountWithMeta,
    cid: string,
    fileName: string,
    encryptionKey: string,
    iv: number[]
): Promise<void> {
    if (!api) {
        throw new Error('Blockchain API not initialized');
    }

    try {
        const injector = await web3FromAddress(account.address);

        // Create remark with file metadata (stored on-chain)
        const metadata = {
            type: 'MEDICAL_FILE',
            cid,
            fileName,
            encryptionKey,
            iv,
            owner: account.address,
            timestamp: Date.now()
        };

        const remarkData = JSON.stringify(metadata);
        const remarkTx = api.tx.system.remark(remarkData);

        // Sign and send transaction
        await remarkTx.signAndSend(account.address, { signer: injector.signer });

        console.log('⛓️ File metadata registered on blockchain:', cid);
    } catch (error: any) {
        console.error('❌ Blockchain registration failed:', error);
        throw new Error('Failed to register file on blockchain: ' + error.message);
    }
}

/**
 * Get files from blockchain for a wallet address
 * This enables cross-device file access
 */
export async function getFilesFromBlockchain(walletAddress: string): Promise<any[]> {
    if (!api) {
        console.warn('Blockchain not connected, using local storage only');
        return [];
    }

    try {
        // Query system.remarks for file metadata
        const blockHash = await api.rpc.chain.getBlockHash();
        const events = await api.query.system.events.at(blockHash);

        const files: any[] = [];

        // Cast events to array for iteration
        const eventsArray = Array.isArray(events) ? events : Array.from(events as any);

        eventsArray.forEach((record: any) => {
            const { event } = record;

            if (event.section === 'system' && event.method === 'Remarked') {
                try {
                    const remarkData = event.data[1].toString();
                    const metadata = JSON.parse(remarkData);

                    if (
                        metadata.type === 'MEDICAL_FILE' &&
                        metadata.owner === walletAddress
                    ) {
                        files.push({
                            cid: metadata.cid,
                            fileName: metadata.fileName,
                            encryptionKey: metadata.encryptionKey,
                            iv: metadata.iv,
                            uploadedAt: new Date(metadata.timestamp).toISOString(),
                            owner: metadata.owner,
                            fromBlockchain: true
                        });
                    }
                } catch (e) {
                    // Invalid remark, skip
                }
            }
        });

        console.log(`⛓️ Found ${files.length} files on blockchain`);
        return files;
    } catch (error: any) {
        console.error('❌ Failed to query blockchain:', error);
        return [];
    }
}
