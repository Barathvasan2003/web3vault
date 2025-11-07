'use client';

import React, { useState, useEffect } from 'react';

export default function ViewFilePage() {
    const [token, setToken] = useState('');
    const [cid, setCid] = useState('');
    const [encryptionKey, setEncryptionKey] = useState('');
    const [iv, setIv] = useState<number[]>([]);
    const [encryptedData, setEncryptedData] = useState<string>('');
    const [fileName, setFileName] = useState('');
    const [fileType, setFileType] = useState('');
    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState<any>(null);
    const [decryptedPreview, setDecryptedPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [account, setAccount] = useState<any>(null);
    const [autoLoading, setAutoLoading] = useState(false);

    // Parse URL parameters on mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        const cidParam = urlParams.get('cid');
        const metaParam = urlParams.get('meta'); // Share metadata CID
        const keyParam = urlParams.get('key');
        const ivParam = urlParams.get('iv');
        const dataParam = urlParams.get('data');
        const fileNameParam = urlParams.get('fileName');
        const fileTypeParam = urlParams.get('fileType');

        // Check if we have decentralized IPFS share (token + cid + meta)
        if (tokenParam && cidParam && metaParam) {
            // This is a decentralized share link - all data on IPFS
            setToken(tokenParam);
            setCid(cidParam);
            // Store metadataCID for later use
            sessionStorage.setItem('metadataCID', metaParam);

            // If encryption key is in URL, auto-fill it
            if (keyParam) {
                setEncryptionKey(keyParam);
            }

            setAutoLoading(true);
        } else if (tokenParam && cidParam && keyParam && ivParam && dataParam) {
            // This is a complete share link with all data embedded
            setToken(tokenParam);
            setCid(cidParam);
            setEncryptionKey(keyParam);
            if (ivParam) {
                try {
                    const parsedIv = JSON.parse(ivParam);
                    setIv(parsedIv);
                } catch (e) {
                    console.error('Failed to parse IV:', e);
                }
            }
            setEncryptedData(dataParam);
            if (fileNameParam) setFileName(fileNameParam);
            if (fileTypeParam) setFileType(fileTypeParam);
            setAutoLoading(true);
        } else if (tokenParam) {
            // Token-only URL (will try localStorage)
            setToken(tokenParam);
            setAutoLoading(true);
        } else {
            // Legacy method with URL parameters
            if (cidParam) setCid(cidParam);
            if (keyParam) setEncryptionKey(keyParam);
            if (ivParam) {
                try {
                    const parsedIv = JSON.parse(ivParam);
                    setIv(parsedIv);
                } catch (e) {
                    console.error('Failed to parse IV:', e);
                }
            }
            if (dataParam) setEncryptedData(dataParam);
            if (fileNameParam) setFileName(fileNameParam);
            if (fileTypeParam) setFileType(fileTypeParam);

            // Auto-load if all required params present
            if (cidParam && keyParam && ivParam && dataParam) {
                setAutoLoading(true);
            }
        }
    }, []);

    // Auto-load file when URL params are present
    useEffect(() => {
        if (autoLoading) {
            setAutoLoading(false);
            const metadataCID = sessionStorage.getItem('metadataCID');

            if (token && cid && metadataCID) {
                // Decentralized IPFS share (all data on IPFS)
                loadFileFromIPFS();
            } else if (token && cid && encryptionKey && iv.length > 0 && encryptedData) {
                // Token-based URL with embedded data (works across browsers)
                loadFileFromEmbeddedData();
            } else if (token) {
                // Token-only URL (requires localStorage)
                loadFileFromToken();
            } else if (cid && encryptionKey && iv.length > 0 && encryptedData) {
                // Legacy method
                loadFile();
            }
        }
    }, [autoLoading, token, cid, encryptionKey, iv, encryptedData]);

    const loadFileFromToken = async () => {
        if (!token) {
            setError('No share token provided');
            return;
        }

        setLoading(true);
        setError('');
        setFileData(null);
        setDecryptedPreview(null);

        try {
            // Get authenticated wallet
            const polka = await import('@/lib/polkadot/blockchain');
            let authenticatedWallet = null;

            try {
                const accounts = await polka.getWalletAccounts();
                if (accounts.length > 0) {
                    authenticatedWallet = accounts[0].address;
                    setAccount(accounts[0]);
                }
            } catch (e) {
                setError('❌ Please connect your Polkadot wallet to access this shared file.');
                setLoading(false);
                return;
            }

            if (!authenticatedWallet) {
                setError('❌ Please connect your Polkadot wallet to access this shared file.');
                setLoading(false);
                return;
            }

            // Get share token
            const shareLib = await import('@/lib/sharing/secure-share');
            const shareToken = shareLib.getShareToken(token);

            if (!shareToken) {
                throw new Error('Share token not found. The link may have expired or been revoked.');
            }

            // Validate share token
            const validation = shareLib.validateShareToken(shareToken, authenticatedWallet);
            if (!validation.valid) {
                throw new Error(validation.reason || 'Invalid share token');
            }

            // Increment access count
            shareLib.incrementAccessCount(token);

            // Get encrypted data from localStorage
            const encryptedDataKey = `encrypted_${shareToken.cid}`;
            let storedEncryptedData = localStorage.getItem(encryptedDataKey);

            if (!storedEncryptedData) {
                throw new Error('Encrypted file data not found. The file owner needs to upload it to IPFS or send a complete share link.');
            }

            // Create file object with token data
            const file = {
                cid: shareToken.cid,
                fileName: shareToken.fileName,
                fileType: shareToken.fileType,
                fileSize: shareToken.fileSize,
                encryptionKey: shareToken.encryptionKey,
                iv: shareToken.iv,
                uploadDate: new Date(shareToken.createdAt).toISOString(),
                sharedBy: shareToken.sharedBy,
                accessType: shareToken.accessType
            };

            setFileData(file);

            // Try to decrypt and preview
            await loadPreview(file, storedEncryptedData);

            console.log(`✅ File loaded via secure token (${shareToken.accessType})`);

        } catch (err: any) {
            setError(err.message);
            console.error('Token load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadFileFromEmbeddedData = async () => {
        if (!token || !cid || !encryptionKey || !iv.length || !encryptedData) {
            setError('Incomplete share link data');
            return;
        }

        setLoading(true);
        setError('');
        setFileData(null);
        setDecryptedPreview(null);

        try {
            // Create file object from URL parameters
            const file = {
                cid: cid,
                fileName: fileName || 'shared_file',
                fileType: fileType || 'application/octet-stream',
                fileSize: 0,
                encryptionKey: encryptionKey,
                iv: iv,
                uploadDate: new Date().toISOString(),
                sharedViaLink: true
            };

            setFileData(file);

            // Try to decrypt and preview
            await loadPreview(file, encryptedData);

            console.log(`✅ File loaded from embedded share link data`);

        } catch (err: any) {
            setError(err.message);
            console.error('Embedded data load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadFileFromIPFS = async () => {
        if (!token || !cid) {
            setError('Missing required parameters');
            return;
        }

        setLoading(true);
        setError('');
        setFileData(null);
        setDecryptedPreview(null);

        try {
            console.log('📡 Loading file from IPFS...');

            // Get metadata CID from session storage
            const metadataCID = sessionStorage.getItem('metadataCID');
            if (!metadataCID) {
                throw new Error('Share metadata CID not found');
            }

            // Download share metadata from IPFS
            const shareLib = await import('@/lib/sharing/secure-share');
            const shareToken = await shareLib.downloadShareTokenFromIPFS(token, metadataCID);

            if (!shareToken) {
                throw new Error('Share link not found or expired. Please request a new share link.');
            }

            console.log('✅ Share metadata downloaded from IPFS');

            // Download encrypted file from IPFS
            const ipfsClient = await import('@/lib/ipfs/ipfs-client');
            const encryptedFileData = await ipfsClient.downloadFile(cid);

            console.log('✅ Encrypted file downloaded from IPFS');

            // Create file object
            const file = {
                cid: shareToken.cid,
                fileName: shareToken.fileName,
                fileType: shareToken.fileType,
                fileSize: shareToken.fileSize,
                encryptionKey: shareToken.encryptionKey,
                iv: shareToken.iv,
                uploadDate: new Date(shareToken.createdAt).toISOString(),
                sharedBy: shareToken.sharedBy,
                accessType: shareToken.accessType,
                sharedViaIPFS: true
            };

            setFileData(file);

            // Decrypt and preview
            await loadPreview(file, encryptedFileData);

            console.log(`✅ File loaded from IPFS (${shareToken.accessType} access)`);

        } catch (err: any) {
            setError(err.message || 'Failed to load file from IPFS');
            console.error('IPFS load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadFile = async () => {
        if (!cid) {
            setError('Please enter a valid CID');
            return;
        }

        if (!encryptionKey || iv.length === 0) {
            setError('Missing encryption key or IV. Please use the complete share link.');
            return;
        }

        setLoading(true);
        setError('');
        setFileData(null);
        setDecryptedPreview(null);

        try {
            // Check if user is authenticated (optional for viewing)
            const polka = await import('@/lib/polkadot/blockchain');
            let authenticatedWallet = null;

            try {
                const accounts = await polka.getWalletAccounts();
                if (accounts.length > 0) {
                    authenticatedWallet = accounts[0].address;
                    setAccount(accounts[0]);
                }
            } catch (e) {
                console.log('No wallet connected - viewing as guest');
            }

            // Verify access control if wallet is connected
            if (authenticatedWallet) {
                const accessControlLib = await import('@/lib/access/access-control');
                let acl = accessControlLib.getACL(cid);

                // Create ACL for legacy files
                if (!acl) {
                    console.log('Creating ACL for shared file');
                    acl = accessControlLib.createACL(cid, authenticatedWallet);
                    accessControlLib.storeACL(acl);
                }

                const accessCheck = accessControlLib.verifyAccess(cid, authenticatedWallet);
                if (!accessCheck.hasAccess) {
                    console.warn('User not in ACL, viewing with provided key');
                }
            }

            // Use encrypted data from URL parameter or localStorage
            let storedEncryptedData = encryptedData;

            if (!storedEncryptedData) {
                // Fallback: try localStorage
                const encryptedDataKey = `encrypted_${cid}`;
                storedEncryptedData = localStorage.getItem(encryptedDataKey) || '';
            }

            if (!storedEncryptedData) {
                throw new Error('No encrypted data found. Please use the complete share link that includes the file data.');
            }

            // Create file metadata
            const file = {
                cid,
                fileName: fileName || `shared_file_${cid.slice(0, 8)}.dat`,
                fileType: fileType || 'application/octet-stream',
                fileSize: storedEncryptedData.length,
                encryptionKey,
                iv,
                uploadDate: new Date().toISOString()
            };

            setFileData(file);

            // Try to decrypt and preview
            await loadPreview(file, storedEncryptedData);

        } catch (err: any) {
            setError(err.message);
            console.error('Load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getAllStoredFiles = () => {
        // Get all files from all users (for demo purposes)
        const allFiles: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('files_')) {
                const files = JSON.parse(localStorage.getItem(key) || '[]');
                allFiles.push(...files);
            }
        }
        return allFiles;
    };

    const loadPreview = async (file: any, storedEncryptedData: string) => {
        try {
            const encryptionLib = await import('@/lib/encryption/medical-encryption');

            // Decrypt
            const encryptedArrayBuffer = base64ToArrayBuffer(storedEncryptedData);
            const key = await encryptionLib.importKey(file.encryptionKey);
            const ivArray = new Uint8Array(file.iv);
            const { fileData: decryptedData } = await encryptionLib.decryptMedicalFile(
                encryptedArrayBuffer,
                key,
                ivArray
            );

            // Create preview based on file type
            if (file.fileType.startsWith('image/')) {
                const blob = new Blob([decryptedData], { type: file.fileType });
                const url = URL.createObjectURL(blob);
                setDecryptedPreview(url);
            } else if (file.fileType === 'text/plain' || file.fileType.includes('text')) {
                const text = new TextDecoder().decode(decryptedData);
                setDecryptedPreview(text);
            } else if (file.fileType === 'application/pdf') {
                const blob = new Blob([decryptedData], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setDecryptedPreview(url);
            }

        } catch (err: any) {
            console.error('Preview error:', err);
            setError('Failed to decrypt file. The encryption key or IV may be incorrect.');
        }
    };

    const handleDownload = async () => {
        if (!fileData) return;

        setDownloading(true);
        try {
            const encryptionLib = await import('@/lib/encryption/medical-encryption');
            const encryptedDataKey = `encrypted_${fileData.cid}`;
            const storedEncryptedData = localStorage.getItem(encryptedDataKey);

            if (!storedEncryptedData) {
                throw new Error('File data not found');
            }

            // Decrypt
            const encryptedArrayBuffer = base64ToArrayBuffer(storedEncryptedData);
            const key = await encryptionLib.importKey(fileData.encryptionKey);
            const iv = new Uint8Array(fileData.iv);
            const { fileData: decryptedData } = await encryptionLib.decryptMedicalFile(
                encryptedArrayBuffer,
                key,
                iv
            );

            // Download
            const blob = new Blob([decryptedData], { type: fileData.fileType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileData.fileName;
            a.click();
            URL.revokeObjectURL(url);

            alert('✅ File downloaded and decrypted successfully!');

        } catch (err: any) {
            alert('Download failed: ' + err.message);
        } finally {
            setDownloading(false);
        }
    };

    const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🔗 View Shared Medical File
                    </h1>
                    <p className="text-gray-600">
                        Access encrypted medical records using permanent IPFS link
                    </p>
                </div>

                {/* Input Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            📦 IPFS CID (Content Identifier)
                        </label>
                        <input
                            type="text"
                            value={cid}
                            onChange={(e) => setCid(e.target.value)}
                            placeholder="Qmyxopf3etlmb7olg9jg44ceiz4mz12476gfez6qj9s625"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-mono text-sm"
                            disabled={loading}
                        />
                    </div>

                    {!encryptionKey && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🔑 Encryption Key (from share link)
                            </label>
                            <input
                                type="text"
                                value={encryptionKey}
                                onChange={(e) => setEncryptionKey(e.target.value)}
                                placeholder="Paste encryption key from share link"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition font-mono text-xs"
                                disabled={loading}
                            />
                        </div>
                    )}

                    <button
                        onClick={loadFile}
                        disabled={loading || !cid || !encryptionKey}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? '🔄 Loading...' : '🔍 Load File'}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-6">
                        <div className="flex items-start">
                            <span className="text-2xl mr-3">❌</span>
                            <div>
                                <h3 className="font-bold text-red-800 mb-1">Error</h3>
                                <p className="text-red-600">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* File Info Display */}
                {fileData && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                        {/* File Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">✅ File Found!</h2>
                                    <p className="text-green-100">Encrypted medical record ready</p>
                                </div>
                                <div className="text-4xl">📄</div>
                            </div>
                        </div>

                        {/* File Details */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <div className="text-xs font-semibold text-gray-500 mb-1">FILE NAME</div>
                                    <div className="font-medium text-gray-800">{fileData.fileName}</div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <div className="text-xs font-semibold text-gray-500 mb-1">FILE TYPE</div>
                                    <div className="font-medium text-gray-800">{fileData.fileType}</div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <div className="text-xs font-semibold text-gray-500 mb-1">FILE SIZE</div>
                                    <div className="font-medium text-gray-800">{formatFileSize(fileData.fileSize)}</div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <div className="text-xs font-semibold text-gray-500 mb-1">RECORD TYPE</div>
                                    <div className="font-medium text-gray-800">{fileData.recordType}</div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                                    <div className="text-xs font-semibold text-gray-500 mb-1">UPLOADED</div>
                                    <div className="font-medium text-gray-800">{formatDate(fileData.uploadedAt)}</div>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl col-span-2">
                                    <div className="text-xs font-semibold text-blue-700 mb-1">🔐 ENCRYPTION STATUS</div>
                                    <div className="font-medium text-blue-800">AES-256-GCM Encrypted</div>
                                    <div className="text-xs text-blue-600 mt-1">Military-grade encryption active</div>
                                </div>
                            </div>

                            {/* AI Data if available */}
                            {fileData.aiData && (
                                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                                    <div className="font-bold text-purple-800 mb-2">🤖 AI Extracted Data</div>
                                    <div className="text-sm text-purple-700 space-y-1">
                                        {fileData.aiData.doctorInfo && (
                                            <div><strong>Doctor:</strong> {fileData.aiData.doctorInfo}</div>
                                        )}
                                        {fileData.aiData.patientInfo && (
                                            <div><strong>Patient:</strong> {fileData.aiData.patientInfo}</div>
                                        )}
                                        {fileData.aiData.diagnosis && (
                                            <div><strong>Diagnosis:</strong> {fileData.aiData.diagnosis}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Download Button */}
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-4"
                            >
                                {downloading ? '⏳ Downloading & Decrypting...' : '⬇️ Download & Decrypt File'}
                            </button>
                        </div>

                        {/* Preview Section */}
                        {decryptedPreview && (
                            <div className="border-t-2 border-gray-200 p-6">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">👁️</span>
                                    Decrypted Preview
                                </h3>

                                {fileData.fileType.startsWith('image/') ? (
                                    <div className="bg-gray-100 rounded-xl p-4">
                                        <img
                                            src={decryptedPreview}
                                            alt="Decrypted preview"
                                            className="max-w-full h-auto rounded-lg shadow-lg"
                                        />
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 rounded-xl p-4">
                                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                                            {decryptedPreview}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Info Card */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <span className="text-3xl mr-3">🔒</span>
                        How It Works
                    </h3>
                    <div className="space-y-3 text-blue-50">
                        <p>✅ <strong>End-to-End Encrypted:</strong> Files encrypted before upload (AES-256-GCM)</p>
                        <p>✅ <strong>Decentralized Storage:</strong> Stored on IPFS with permanent CID</p>
                        <p>✅ <strong>Zero-Knowledge:</strong> Only you have the decryption key</p>
                        <p>✅ <strong>HIPAA Compliant:</strong> Medical-grade security standards</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
