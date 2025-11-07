'use client';

import React, { useState, useEffect } from 'react';

interface FileListProps {
    account: any;
    refreshTrigger: number;
    sharedMode?: boolean;
}

export default function FileList({ account, refreshTrigger, sharedMode = false }: FileListProps) {
    const [files, setFiles] = useState<any[]>([]);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [shareModal, setShareModal] = useState<any>(null);
    const [aiModal, setAiModal] = useState<any>(null);
    const [isEditingAI, setIsEditingAI] = useState(false);
    const [editedAIData, setEditedAIData] = useState<any>(null);
    const [imagePreviewModal, setImagePreviewModal] = useState<any>(null);
    const [shareOption, setShareOption] = useState<'one-time' | '24-hours' | 'custom' | 'permanent'>('permanent');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [customDays, setCustomDays] = useState(0);
    const [shareWalletAddress, setShareWalletAddress] = useState('');
    const [generatedShareLink, setGeneratedShareLink] = useState('');

    useEffect(() => {
        loadFiles();
    }, [account, refreshTrigger, sharedMode]);

    const loadFiles = async () => {
        if (sharedMode) {
            // Load files shared with current user
            const accessControlLib = await import('@/lib/access/access-control');
            const sharedFiles: any[] = [];

            // Get all ACLs from localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('acl_')) {
                    const aclData = localStorage.getItem(key);
                    if (aclData) {
                        const acl = JSON.parse(aclData);
                        // Check if current user has access and is not the owner
                        if (acl.owner !== account.address && accessControlLib.hasAccess(acl, account.address)) {
                            // Find the corresponding file data
                            const cid = acl.cid;
                            // Look for file in all users' file lists
                            for (let j = 0; j < localStorage.length; j++) {
                                const fileKey = localStorage.key(j);
                                if (fileKey && fileKey.startsWith('files_')) {
                                    const filesData = localStorage.getItem(fileKey);
                                    if (filesData) {
                                        const filesList = JSON.parse(filesData);
                                        const matchingFile = filesList.find((f: any) => f.cid === cid);
                                        if (matchingFile) {
                                            sharedFiles.push({ ...matchingFile, sharedBy: acl.owner });
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            setFiles(sharedFiles.reverse());
        } else {
            // Load user's own files
            const storedFiles = JSON.parse(localStorage.getItem(`files_${account.address}`) || '[]');
            setFiles(storedFiles.reverse());
        }
    };

    const handleDownload = async (file: any) => {
        try {
            setDownloading(file.cid);

            // Verify access control FIRST
            const accessControlLib = await import('@/lib/access/access-control');

            // Check if ACL exists, if not create one for legacy files
            let acl = accessControlLib.getACL(file.cid);
            if (!acl) {
                console.log('⚠️ Legacy file detected - creating ACL automatically');
                // For legacy files, the current user who can access it is the owner
                acl = accessControlLib.createACL(file.cid, account.address);
                accessControlLib.storeACL(acl);
                console.log('✅ ACL created for legacy file');
            }

            const accessCheck = accessControlLib.verifyAccess(file.cid, account.address);

            if (!accessCheck.hasAccess) {
                alert(`❌ Access Denied!\n\n${accessCheck.reason}\n\nThis file is protected and you do not have permission to access it.`);
                setDownloading(null);
                return;
            }

            console.log(`✅ Access verified: ${accessCheck.accessType}`);

            // Fetch encrypted file from IPFS only
            const encryptionLib = await import('@/lib/encryption/medical-encryption');
            const ipfsLib = await import('@/lib/ipfs/ipfs-client');

            // Get file from IPFS network
            console.log('📥 Fetching encrypted file from IPFS:', file.cid);
            const result = await ipfsLib.downloadFromIPFS(file.cid);

            if (!result || !result.encryptedData) {
                throw new Error('File not found on IPFS network. The file may not have been uploaded to NFT.Storage. Please re-upload with a valid NFT.Storage API key.');
            }

            // Decrypt the file
            const key = await encryptionLib.importKey(file.encryptionKey);
            const iv = new Uint8Array(file.iv);
            const { fileData: decryptedData } = await encryptionLib.decryptMedicalFile(
                result.encryptedData,
                key,
                iv
            );

            // Create blob and download
            const blob = new Blob([decryptedData], { type: file.fileType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.fileName;
            a.click();
            URL.revokeObjectURL(url);

        } catch (err: any) {
            alert('Download failed: ' + err.message);
        } finally {
            setDownloading(null);
        }
    };

    const handleDelete = (cid: string) => {
        if (!confirm('Delete this file? It will be removed from your local list only.')) return;

        const updatedFiles = files.filter(f => f.cid !== cid);
        localStorage.setItem(`files_${account.address}`, JSON.stringify(updatedFiles));
        setFiles(updatedFiles);
    };

    const loadImagePreview = async (file: any) => {
        try {
            const encryptionLib = await import('@/lib/encryption/medical-encryption');
            const ipfsLib = await import('@/lib/ipfs/ipfs-client');

            // Try to get file from IPFS
            console.log('📥 Fetching image from IPFS:', file.cid);
            const result = await ipfsLib.downloadFromIPFS(file.cid);

            if (!result || !result.encryptedData) {
                throw new Error('Image not found on IPFS network. Please re-upload with NFT.Storage API key.');
            }

            const key = await encryptionLib.importKey(file.encryptionKey);
            const iv = new Uint8Array(file.iv);
            const { fileData: decryptedData } = await encryptionLib.decryptMedicalFile(
                result.encryptedData,
                key,
                iv
            );

            const blob = new Blob([decryptedData], { type: file.fileType });
            const imageUrl = URL.createObjectURL(blob);
            return imageUrl;
        } catch (err) {
            console.error('Failed to load image:', err);
            return null;
        }
    };

    const handleEditAI = () => {
        setIsEditingAI(true);
        setEditedAIData(JSON.parse(JSON.stringify(aiModal.aiData))); // Deep copy
    };

    const handleSaveAI = () => {
        // Update the file's AI data in localStorage
        const updatedFiles = files.map(f => {
            if (f.cid === aiModal.cid) {
                return { ...f, aiData: editedAIData };
            }
            return f;
        });

        localStorage.setItem(`files_${account.address}`, JSON.stringify(updatedFiles));
        setFiles(updatedFiles);

        // Update the modal with new data
        setAiModal({ ...aiModal, aiData: editedAIData });
        setIsEditingAI(false);
    };

    const handleCancelEdit = () => {
        setIsEditingAI(false);
        setEditedAIData(null);
    };

    const updateAIField = (field: string, value: any) => {
        setEditedAIData({ ...editedAIData, [field]: value });
    };

    const updateMedicationField = (index: number, field: string, value: any) => {
        const updatedMeds = [...editedAIData.medications];
        updatedMeds[index] = { ...updatedMeds[index], [field]: value };
        setEditedAIData({ ...editedAIData, medications: updatedMeds });
    };

    const calculateDaysBetween = (start: string, end: string) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        if (type === 'start') {
            setCustomStartDate(value);
            if (customEndDate) {
                setCustomDays(calculateDaysBetween(value, customEndDate));
            }
        } else {
            setCustomEndDate(value);
            if (customStartDate) {
                setCustomDays(calculateDaysBetween(customStartDate, value));
            }
        }
    };

    const handleGrantAccess = async () => {
        if (!shareModal || !shareWalletAddress) {
            alert('❌ Please enter a wallet address to grant access to.');
            return;
        }

        // Basic validation for Polkadot address (should start with 1, 5, or similar)
        if (shareWalletAddress.length < 40) {
            alert('❌ Invalid Polkadot wallet address. Please check and try again.');
            return;
        }

        try {
            // Import both ACL and secure share libraries
            const accessControlLib = await import('@/lib/access/access-control');
            const shareLib = await import('@/lib/sharing/secure-share');

            // Get current ACL
            const acl = accessControlLib.getACL(shareModal.cid);
            if (!acl) {
                alert('❌ Error: Access control list not found for this file.');
                return;
            }

            // Verify current user is the owner
            if (acl.owner !== account.address) {
                alert('❌ Access Denied: Only the file owner can grant access to others.');
                return;
            }

            // Calculate duration in hours
            let durationHours: number | undefined;
            let accessTypeForToken: 'one-time' | 'temporary' | 'permanent' = 'permanent';

            if (shareOption === 'one-time') {
                durationHours = 1;
                accessTypeForToken = 'one-time';
            } else if (shareOption === '24-hours') {
                durationHours = 24;
                accessTypeForToken = 'temporary';
            } else if (shareOption === 'custom' && customDays > 0) {
                durationHours = customDays * 24;
                accessTypeForToken = 'temporary';
            }

            // Grant access in ACL
            const accessType = shareOption === 'permanent' ? 'permanent' : 'temporary';
            const updatedACL = accessControlLib.grantAccess(
                acl,
                shareWalletAddress,
                accessType,
                account.address, // grantedBy
                durationHours
            );

            // Save updated ACL
            accessControlLib.storeACL(updatedACL);

            // Create secure share token
            const shareToken = shareLib.createShareToken(
                shareModal.cid,
                shareModal.encryptionKey,
                shareModal.iv,
                shareModal.fileName,
                shareModal.fileType,
                shareModal.fileSize || 0,
                account.address,
                shareWalletAddress,
                accessTypeForToken,
                durationHours
            );

            // Store share token
            shareLib.storeShareToken(shareToken);

            // File is already on IPFS - use existing CID
            console.log('📤 Generating share link with IPFS CID:', shareModal.cid);

            try {
                // Upload share metadata to IPFS
                const metadataCID = await shareLib.uploadShareTokenToIPFS(shareToken);

                // Generate share URL with existing file CID, metadata CID, and encryption key
                const params = new URLSearchParams({
                    cid: shareModal.cid, // Use existing file CID
                    meta: metadataCID,
                    token: shareToken.id,
                    key: shareToken.encryptionKey // Add encryption key to URL
                });

                const shareUrl = `${window.location.origin}/view?${params.toString()}`;

                // Set the generated share link to display in UI
                setGeneratedShareLink(shareUrl);

                // Success message with share URL
                let expiryMessage = '';
                if (durationHours) {
                    expiryMessage = `\nDuration: ${durationHours} hours`;
                }

                const message = `✅ Access Granted Successfully!\n\nFile CID: ${shareModal.cid}\nMetadata CID: ${metadataCID}\nWallet: ${shareWalletAddress}\nAccess Type: ${accessType}${expiryMessage}\n\n🔗 Secure Share Link:\n${shareUrl}\n\nCopy this link to share the file securely.`;

                // Copy share URL to clipboard
                navigator.clipboard.writeText(shareUrl);

                alert(message + '\n\n📋 Share link copied to clipboard!');

                // Don't clear wallet input so user can see what was granted

            } catch (ipfsError: any) {
                console.error('Error uploading metadata to IPFS:', ipfsError);
                alert(`❌ Error creating share link: ${ipfsError.message}`);
            }

        } catch (error: any) {
            console.error('Error granting access:', error);
            alert(`❌ Error granting access: ${error.message}`);
        }
    }; const handleViewAccessList = async () => {
        if (!shareModal) return;

        try {
            const accessControlLib = await import('@/lib/access/access-control');
            const acl = accessControlLib.getACL(shareModal.cid);

            if (!acl) {
                alert('❌ No access control found for this file.');
                return;
            }

            const accessInfo = accessControlLib.getAccessInfo(acl);
            alert(`📋 Access Control List\n\n${accessInfo}`);

        } catch (error: any) {
            console.error('Error viewing access list:', error);
            alert(`❌ Error: ${error.message}`);
        }
    };

    const getRecordTypeColor = (type: string) => {
        const colors: any = {
            prescription: 'bg-green-500/20 text-green-400 border-green-500/50',
            report: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
            scan: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
            vaccine: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
            other: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
        };
        return colors[type] || colors.other;
    };

    const getRecordTypeBadge = (type: string) => {
        const badges: any = {
            prescription: 'bg-green-100 text-green-700 border-2 border-green-300',
            report: 'bg-blue-100 text-blue-700 border-2 border-blue-300',
            scan: 'bg-purple-100 text-purple-700 border-2 border-purple-300',
            vaccine: 'bg-amber-100 text-amber-700 border-2 border-amber-300',
            other: 'bg-gray-100 text-gray-700 border-2 border-gray-300',
        };
        return badges[type] || badges.other;
    };

    const getRecordTypeEmoji = (type: string) => {
        const emojis: any = {
            prescription: '💊',
            report: '📋',
            scan: '🔬',
            vaccine: '💉',
            other: '📄',
        };
        return emojis[type] || emojis.other;
    };

    if (files.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center shadow-lg">
                <div className="flex justify-center mb-6">
                    {sharedMode ? (
                        <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    ) : (
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                    )}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-800">
                    {sharedMode ? 'No Shared Files Yet' : 'No Records Yet'}
                </h3>
                <p className="text-gray-600">
                    {sharedMode
                        ? 'Files shared with you will appear here'
                        : 'Upload your first medical record to get started'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                        My Medical Records
                    </h2>
                </div>
                <div className="text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-teal-500 px-5 py-2.5 rounded-xl shadow-lg">
                    {files.length} {files.length === 1 ? 'file' : 'files'}
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="relative">
                <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide hover:scrollbar-show" style={{ scrollbarWidth: 'thin' }}>
                    {files.map((file, index) => (
                        <div
                            key={file.cid}
                            style={{ animationDelay: `${index * 100}ms` }}
                            className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 group snap-start animate-slide-up"
                        >
                            {/* File Icon & Type Badge */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                {file.fileType.startsWith('image/') ? (
                                    <button
                                        onClick={() => setImagePreviewModal(file)}
                                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all hover:scale-105"
                                    >
                                        VIEW IMAGE
                                    </button>
                                ) : (
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getRecordTypeBadge(file.recordType)}`}>
                                        {file.recordType.toUpperCase()}
                                    </span>
                                )}
                            </div>

                            {/* File Name */}
                            <h3 className="text-lg font-bold mb-3 truncate text-gray-800 group-hover:text-blue-600 transition-colors">
                                {file.fileName}
                            </h3>

                            {/* File Info */}
                            <div className="space-y-2 text-sm text-gray-600 mb-4">
                                <p className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                    <span>{formatFileSize(file.fileSize)}</span>
                                </p>
                                <p className="flex items-center gap-2 truncate">
                                    <svg className="w-4 h-4 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="truncate text-xs font-mono">{file.cid.substring(0, 20)}...</span>
                                </p>
                            </div>

                            {/* AI Data Preview */}
                            {file.aiData?.medications?.length > 0 && (
                                <div
                                    className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl cursor-pointer hover:border-purple-400 hover:shadow-lg transition-all"
                                    onClick={() => setAiModal(file)}
                                >
                                    <p className="text-sm text-purple-700 font-bold mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        AI Extracted Data
                                    </p>
                                    <p className="text-xs text-gray-700">
                                        {file.aiData.medications.length} medicine(s) • {file.aiData.doctorName || 'Unknown'} • {file.aiData.patientName || 'Unknown'}
                                    </p>
                                </div>
                            )}

                            {/* No AI Data Message */}
                            {!file.aiData?.medications?.length && file.fileType.startsWith('image/') && (
                                <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                                    <p className="text-xs text-yellow-700 font-medium flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        No AI data extracted
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => handleDownload(file)}
                                    disabled={downloading === file.cid}
                                    className="flex items-center justify-center gap-1 px-3 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all text-xs font-bold disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    {downloading === file.cid ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span>Download</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShareModal(file)}
                                    className="flex items-center justify-center gap-1 px-3 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all text-xs font-bold shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    <span>Share</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(file.cid)}
                                    className="flex items-center justify-center gap-1 px-3 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all text-xs font-bold shadow-lg hover:shadow-xl hover:scale-105"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Scroll Hint */}
                <div className="mt-4 text-center text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-bounce-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Scroll horizontally to see more records
                </div>
            </div>

            {/* Share Modal */}
            {shareModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white max-w-2xl w-full rounded-3xl p-8 border border-gray-200 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                🔗 Share File
                            </h3>
                            <button
                                onClick={() => {
                                    setShareModal(null);
                                    setShareOption('permanent');
                                    setShareWalletAddress('');
                                    setGeneratedShareLink('');
                                }}
                                className="text-4xl text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                ×
                            </button>
                        </div>                        <div className="space-y-6">
                            {/* Share Options */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Select Share Type:</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShareOption('one-time')}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${shareOption === 'one-time'
                                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                                            : 'border-gray-300 bg-white hover:border-green-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl">🔒</span>
                                            <span className="font-bold text-gray-800">One-Time Access</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Link expires after first view</p>
                                    </button>

                                    <button
                                        onClick={() => setShareOption('24-hours')}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${shareOption === '24-hours'
                                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg'
                                            : 'border-gray-300 bg-white hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl">⏰</span>
                                            <span className="font-bold text-gray-800">24 Hours</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Access for 1 day</p>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShareOption('custom');
                                            const today = new Date().toISOString().split('T')[0];
                                            setCustomStartDate(today);
                                            setCustomEndDate('');
                                            setCustomDays(0);
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${shareOption === 'custom'
                                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg'
                                            : 'border-gray-300 bg-white hover:border-purple-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl">📅</span>
                                            <span className="font-bold text-gray-800">Custom Date Range</span>
                                        </div>
                                        <p className="text-xs text-gray-600">Choose start and end dates</p>
                                    </button>

                                    <button
                                        onClick={() => setShareOption('permanent')}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${shareOption === 'permanent'
                                            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg'
                                            : 'border-gray-300 bg-white hover:border-indigo-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-2xl">♾️</span>
                                            <span className="font-bold text-gray-800">Permanent Access</span>
                                        </div>
                                        <p className="text-xs text-gray-600">No expiration - access anytime</p>
                                    </button>
                                </div>
                            </div>

                            {/* Custom Date Picker */}
                            {shareOption === 'custom' && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border-2 border-purple-300">
                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2">Start Date:</label>
                                            <input
                                                type="date"
                                                value={customStartDate}
                                                onChange={(e) => handleDateChange('start', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl text-sm font-medium text-gray-800 focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-2">End Date:</label>
                                            <input
                                                type="date"
                                                value={customEndDate}
                                                onChange={(e) => handleDateChange('end', e.target.value)}
                                                min={customStartDate}
                                                className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl text-sm font-medium text-gray-800 focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    {customDays > 0 && (
                                        <div className="bg-white p-4 rounded-xl border-2 border-purple-400">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-700">Access Duration:</span>
                                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                    {customDays} {customDays === 1 ? 'Day' : 'Days'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">
                                                From: {new Date(customStartDate).toLocaleDateString()} to {new Date(customEndDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Share Link Info */}
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border-2 border-gray-300">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">
                                        {shareOption === 'one-time' ? '🔒' :
                                            shareOption === '24-hours' ? '⏰' :
                                                shareOption === 'custom' ? '📅' : '♾️'}
                                    </span>
                                    <p className="font-bold text-gray-800">
                                        {shareOption === 'one-time' ? 'One-Time Access Link' :
                                            shareOption === '24-hours' ? '24-Hour Access Link' :
                                                shareOption === 'custom' ? `Custom Access Link (${customDays} ${customDays === 1 ? 'Day' : 'Days'})` : 'Permanent Access Link'}
                                    </p>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">IPFS CID:</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={shareModal.cid}
                                            readOnly
                                            className="flex-1 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-sm font-mono text-gray-800"
                                        />
                                        <button
                                            onClick={() => {
                                                const accessType = shareOption === 'one-time' ? 'One-Time' :
                                                    shareOption === '24-hours' ? '24 Hours' :
                                                        shareOption === 'custom' ? `${customDays} Days (${customStartDate} to ${customEndDate})` :
                                                            'Permanent';
                                                const shareText = `${shareModal.cid}\nAccess Type: ${accessType}`;
                                                navigator.clipboard.writeText(shareText);
                                                alert('CID copied to clipboard!');
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg font-bold transition-all"
                                        >
                                            📋 Copy
                                        </button>
                                    </div>
                                </div>

                                {/* View Link - Secure Token Method */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                                        🔒 Secure Share Link (Recommended):
                                    </label>

                                    {generatedShareLink ? (
                                        // Show generated link
                                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl">
                                            <p className="text-sm font-semibold text-green-800 mb-3">✅ Share Link Generated!</p>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-semibold text-green-700 mb-1">Secure Token URL:</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={generatedShareLink}
                                                            readOnly
                                                            className="flex-1 px-3 py-2 bg-white border-2 border-green-300 rounded-lg text-xs font-mono text-gray-800 break-all"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(generatedShareLink);
                                                                alert('✅ Share link copied to clipboard!');
                                                            }}
                                                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg font-bold transition-all whitespace-nowrap"
                                                        >
                                                            📋 Copy
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => window.open(generatedShareLink, '_blank')}
                                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg font-bold transition-all"
                                                    >
                                                        🔗 Open Link
                                                    </button>
                                                    <button
                                                        onClick={() => setGeneratedShareLink('')}
                                                        className="px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg hover:shadow-lg font-bold transition-all"
                                                    >
                                                        ✨ New Share
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setShareModal(null);
                                                        setShareOption('permanent');
                                                        setShareWalletAddress('');
                                                        setGeneratedShareLink('');
                                                    }}
                                                    className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg hover:shadow-lg font-bold transition-all"
                                                >
                                                    ✅ Done - Close Window
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Show instructions
                                        <>
                                            <p className="text-xs text-gray-500 mb-2">
                                                Generate a secure token-based link after granting access to a wallet. This method doesn't expose encryption keys in the URL.
                                            </p>
                                            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
                                                <p className="text-sm font-semibold text-green-800 mb-2">✅ Best Practice:</p>
                                                <ol className="text-xs text-green-700 space-y-1 ml-4 list-decimal">
                                                    <li>Enter recipient's wallet address below</li>
                                                    <li>Click "✅ Grant Access"</li>
                                                    <li>Secure share link will be generated automatically</li>
                                                    <li>Link is copied to clipboard - send it to recipient</li>
                                                </ol>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Grant Access Section */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-300">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">🔐</span>
                                    <h4 className="font-bold text-gray-800 text-lg">Grant Access to Specific Wallet</h4>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter a Polkadot wallet address to grant them access to this file with the selected permissions above.
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                                            Polkadot Wallet Address:
                                        </label>
                                        <input
                                            type="text"
                                            value={shareWalletAddress}
                                            onChange={(e) => setShareWalletAddress(e.target.value)}
                                            placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY (example)"
                                            className="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl text-sm font-mono text-gray-800 focus:border-blue-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleGrantAccess}
                                            disabled={!shareWalletAddress}
                                            className={`flex-1 py-3 rounded-xl font-bold transition-all ${shareWalletAddress
                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                }`}
                                        >
                                            ✅ Grant Access
                                        </button>
                                        <button
                                            onClick={handleViewAccessList}
                                            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg font-bold transition-all"
                                        >
                                            👥 View Access List
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Warning Message */}
                            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">⚠️</span>
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-bold mb-1">Important Security Note:</p>
                                        <p>Only wallets you explicitly grant access to can download this file. Use the "Grant Access" section above to share with specific people.
                                            {shareOption !== 'permanent' && ' Access will expire based on your selected timeframe.'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        setShareModal(null);
                                        setShareOption('permanent');
                                        setCustomStartDate('');
                                        setCustomEndDate('');
                                        setCustomDays(0);
                                        setShareWalletAddress('');
                                        setGeneratedShareLink('');
                                    }}
                                    className="w-full py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* AI Extraction Modal */}
            {
                aiModal && aiModal.aiData && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white max-w-4xl w-full rounded-3xl p-8 border border-gray-200 shadow-2xl my-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                                    🤖 AI Extraction Results
                                </h3>
                                <div className="flex items-center gap-3">
                                    {!isEditingAI ? (
                                        <button
                                            onClick={handleEditAI}
                                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                        >
                                            ✏️ Edit
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleSaveAI}
                                                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                            >
                                                ✅ Save
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                            >
                                                ❌ Cancel
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            setAiModal(null);
                                            setIsEditingAI(false);
                                            setEditedAIData(null);
                                        }}
                                        className="text-4xl text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                {/* Doctor & Patient Info */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {(isEditingAI ? editedAIData : aiModal.aiData).doctorName && (
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-300 shadow-md">
                                            <p className="text-blue-600 text-sm font-bold mb-3">👨‍⚕️ Doctor Information</p>
                                            {isEditingAI ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editedAIData.doctorName}
                                                        onChange={(e) => updateAIField('doctorName', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-xl font-bold text-xl text-gray-800"
                                                        placeholder="Doctor Name"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editedAIData.doctorSpecialization || ''}
                                                        onChange={(e) => updateAIField('doctorSpecialization', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-xl text-sm text-gray-600"
                                                        placeholder="Specialization"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editedAIData.doctorRegistration || ''}
                                                        onChange={(e) => updateAIField('doctorRegistration', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-xl text-xs text-gray-500"
                                                        placeholder="Registration No."
                                                    />
                                                    <input
                                                        type="text"
                                                        value={editedAIData.clinicName || ''}
                                                        onChange={(e) => updateAIField('clinicName', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-xl text-sm text-gray-600"
                                                        placeholder="📍 Clinic Name"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-gray-800 font-bold text-xl mb-1">{aiModal.aiData.doctorName}</p>
                                                    {aiModal.aiData.doctorSpecialization && (
                                                        <p className="text-gray-600 text-sm mt-1">{aiModal.aiData.doctorSpecialization}</p>
                                                    )}
                                                    {aiModal.aiData.doctorRegistration && (
                                                        <p className="text-gray-500 text-xs mt-1">Reg: {aiModal.aiData.doctorRegistration}</p>
                                                    )}
                                                    {aiModal.aiData.clinicName && (
                                                        <p className="text-gray-600 text-sm mt-1">📍 {aiModal.aiData.clinicName}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {(isEditingAI ? editedAIData : aiModal.aiData).patientName && (
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-300 shadow-md">
                                            <p className="text-green-600 text-sm font-bold mb-3">👤 Patient Information</p>
                                            {isEditingAI ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editedAIData.patientName}
                                                        onChange={(e) => updateAIField('patientName', e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border-2 border-green-300 rounded-xl font-bold text-xl text-gray-800"
                                                        placeholder="Patient Name"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editedAIData.patientAge || ''}
                                                            onChange={(e) => updateAIField('patientAge', e.target.value)}
                                                            className="w-1/2 px-3 py-2 bg-white border-2 border-green-300 rounded-xl text-sm text-gray-600"
                                                            placeholder="Age"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editedAIData.patientGender || ''}
                                                            onChange={(e) => updateAIField('patientGender', e.target.value)}
                                                            className="w-1/2 px-3 py-2 bg-white border-2 border-green-300 rounded-xl text-sm text-gray-600"
                                                            placeholder="Gender"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-gray-800 font-bold text-xl mb-1">{aiModal.aiData.patientName}</p>
                                                    {(aiModal.aiData.patientAge || aiModal.aiData.patientGender) && (
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            {aiModal.aiData.patientAge} {aiModal.aiData.patientGender && `• ${aiModal.aiData.patientGender}`}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Diagnosis */}
                                {(isEditingAI ? editedAIData : aiModal.aiData).diagnosis && (
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 p-5 rounded-2xl shadow-md">
                                        <p className="text-blue-600 text-sm font-bold mb-2">🩺 Diagnosis</p>
                                        {isEditingAI ? (
                                            <textarea
                                                value={editedAIData.diagnosis}
                                                onChange={(e) => updateAIField('diagnosis', e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 bg-white border-2 border-blue-300 rounded-xl text-lg font-semibold text-gray-800"
                                                placeholder="Diagnosis"
                                            />
                                        ) : (
                                            <p className="text-gray-800 text-lg font-semibold">{aiModal.aiData.diagnosis}</p>
                                        )}
                                    </div>
                                )}

                                {/* Medications */}
                                {(isEditingAI ? editedAIData : aiModal.aiData).medications?.length > 0 && (
                                    <div>
                                        <h4 className="text-2xl font-bold mb-4 text-gray-800">💊 Medications ({(isEditingAI ? editedAIData : aiModal.aiData).medications.length})</h4>
                                        <div className="space-y-4">
                                            {(isEditingAI ? editedAIData : aiModal.aiData).medications.map((med: any, i: number) => (
                                                <div key={i} className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 p-6 rounded-2xl shadow-md">
                                                    {isEditingAI ? (
                                                        <div className="space-y-3">
                                                            <div className="flex items-start gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={editedAIData.medications[i].name}
                                                                    onChange={(e) => updateMedicationField(i, 'name', e.target.value)}
                                                                    className="flex-1 px-3 py-2 bg-white border-2 border-purple-300 rounded-xl font-bold text-xl text-gray-800"
                                                                    placeholder="Medicine Name"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={editedAIData.medications[i].dosage}
                                                                    onChange={(e) => updateMedicationField(i, 'dosage', e.target.value)}
                                                                    className="w-32 px-3 py-2 bg-green-500 text-white border-2 border-green-600 rounded-xl font-bold text-sm"
                                                                    placeholder="Dosage"
                                                                />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                value={editedAIData.medications[i].genericName || ''}
                                                                onChange={(e) => updateMedicationField(i, 'genericName', e.target.value)}
                                                                className="w-full px-3 py-2 bg-white border-2 border-purple-300 rounded-xl text-sm text-gray-600"
                                                                placeholder="Generic Name (optional)"
                                                            />
                                                            <div className="grid md:grid-cols-2 gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={editedAIData.medications[i].frequency}
                                                                    onChange={(e) => updateMedicationField(i, 'frequency', e.target.value)}
                                                                    className="px-3 py-2 bg-white border-2 border-purple-300 rounded-xl text-sm"
                                                                    placeholder="Frequency"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={editedAIData.medications[i].timing}
                                                                    onChange={(e) => updateMedicationField(i, 'timing', e.target.value)}
                                                                    className="px-3 py-2 bg-white border-2 border-purple-300 rounded-xl text-sm"
                                                                    placeholder="Timing"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={editedAIData.medications[i].duration || ''}
                                                                    onChange={(e) => updateMedicationField(i, 'duration', e.target.value)}
                                                                    className="px-3 py-2 bg-white border-2 border-purple-300 rounded-xl text-sm"
                                                                    placeholder="Duration (optional)"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={editedAIData.medications[i].instructions || ''}
                                                                    onChange={(e) => updateMedicationField(i, 'instructions', e.target.value)}
                                                                    className="px-3 py-2 bg-white border-2 border-purple-300 rounded-xl text-sm"
                                                                    placeholder="Instructions (optional)"
                                                                />
                                                            </div>
                                                            <textarea
                                                                value={editedAIData.medications[i].medicineInfo || ''}
                                                                onChange={(e) => updateMedicationField(i, 'medicineInfo', e.target.value)}
                                                                rows={2}
                                                                className="w-full px-3 py-2 bg-white border-2 border-purple-300 rounded-xl text-sm"
                                                                placeholder="Medicine Info (optional)"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <p className="text-gray-800 font-bold text-xl mb-1">{med.name}</p>
                                                                    {med.genericName && (
                                                                        <p className="text-gray-600 text-sm">Generic: {med.genericName}</p>
                                                                    )}
                                                                </div>
                                                                <span className="px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-bold ml-2 shadow-md">
                                                                    {med.dosage}
                                                                </span>
                                                            </div>

                                                            <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                                                                <div className="bg-white/50 p-3 rounded-xl">
                                                                    <p className="text-gray-600 font-medium">Frequency:</p>
                                                                    <p className="text-gray-800 font-bold">{med.frequency}</p>
                                                                </div>
                                                                <div className="bg-white/50 p-3 rounded-xl">
                                                                    <p className="text-gray-600 font-medium">Timing:</p>
                                                                    <p className="text-amber-600 font-bold">{med.timing}</p>
                                                                </div>
                                                                {med.duration && (
                                                                    <div className="bg-white/50 p-3 rounded-xl">
                                                                        <p className="text-gray-600 font-medium">Duration:</p>
                                                                        <p className="text-gray-800 font-bold">{med.duration}</p>
                                                                    </div>
                                                                )}
                                                                {med.instructions && (
                                                                    <div className="bg-white/50 p-3 rounded-xl col-span-2">
                                                                        <p className="text-gray-600 font-medium">Instructions:</p>
                                                                        <p className="text-orange-600 font-bold">{med.instructions}</p>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {med.medicineInfo && (
                                                                <div className="mt-3 pt-3 border-t-2 border-purple-200">
                                                                    <p className="text-blue-600 text-sm font-bold mb-2">ℹ️ About this medicine:</p>
                                                                    <p className="text-gray-700 text-sm leading-relaxed">{med.medicineInfo}</p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Info */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {(isEditingAI ? editedAIData : aiModal.aiData).date && (
                                        <div className="bg-gray-100 p-4 rounded-xl border border-gray-300">
                                            <p className="text-gray-600 text-xs font-medium">📅 Prescription Date</p>
                                            {isEditingAI ? (
                                                <input
                                                    type="text"
                                                    value={editedAIData.date}
                                                    onChange={(e) => updateAIField('date', e.target.value)}
                                                    className="w-full px-3 py-2 mt-1 bg-white border-2 border-gray-300 rounded-xl font-bold text-gray-800"
                                                    placeholder="Date"
                                                />
                                            ) : (
                                                <p className="text-gray-800 font-bold mt-1">{aiModal.aiData.date}</p>
                                            )}
                                        </div>
                                    )}
                                    {(isEditingAI ? editedAIData : aiModal.aiData).nextVisit && (
                                        <div className="bg-gray-100 p-4 rounded-xl border border-gray-300">
                                            <p className="text-gray-600 text-xs font-medium">🔄 Next Visit</p>
                                            {isEditingAI ? (
                                                <input
                                                    type="text"
                                                    value={editedAIData.nextVisit}
                                                    onChange={(e) => updateAIField('nextVisit', e.target.value)}
                                                    className="w-full px-3 py-2 mt-1 bg-white border-2 border-gray-300 rounded-xl font-bold text-gray-800"
                                                    placeholder="Next Visit"
                                                />
                                            ) : (
                                                <p className="text-gray-800 font-bold mt-1">{aiModal.aiData.nextVisit}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Additional Notes */}
                                {(isEditingAI ? editedAIData : aiModal.aiData).additionalNotes && (
                                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 p-5 rounded-2xl shadow-md">
                                        <p className="text-yellow-700 text-sm font-bold mb-2">📝 Additional Notes</p>
                                        {isEditingAI ? (
                                            <textarea
                                                value={editedAIData.additionalNotes}
                                                onChange={(e) => updateAIField('additionalNotes', e.target.value)}
                                                rows={3}
                                                className="w-full px-3 py-2 bg-white border-2 border-yellow-300 rounded-xl text-gray-800"
                                                placeholder="Additional Notes"
                                            />
                                        ) : (
                                            <p className="text-gray-800 leading-relaxed">{aiModal.aiData.additionalNotes}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!isEditingAI && (
                                <button
                                    onClick={() => {
                                        setAiModal(null);
                                        setIsEditingAI(false);
                                        setEditedAIData(null);
                                    }}
                                    className="mt-6 w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Image Preview Modal */}
            {
                imagePreviewModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="bg-white max-w-6xl w-full rounded-3xl p-8 border border-gray-200 shadow-2xl relative">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                        📋 Prescription Image
                                    </h3>
                                    <p className="text-gray-600 text-sm">{imagePreviewModal.fileName}</p>
                                </div>
                                <button
                                    onClick={() => setImagePreviewModal(null)}
                                    className="text-4xl text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="bg-gray-100 rounded-2xl p-4 max-h-[70vh] overflow-auto">
                                <ImagePreview file={imagePreviewModal} loadImage={loadImagePreview} />
                            </div>

                            <button
                                onClick={() => setImagePreviewModal(null)}
                                className="mt-6 w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

// Image Preview Component
function ImagePreview({ file, loadImage }: { file: any, loadImage: (file: any) => Promise<string | null> }) {
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            setLoading(true);
            const url = await loadImage(file);
            setImageUrl(url);
            setLoading(false);
        };
        load();

        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [file]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin text-6xl mb-4">⏳</div>
                    <p className="text-gray-600 font-medium">Loading image...</p>
                </div>
            </div>
        );
    }

    if (!imageUrl) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-gray-600 font-medium">Failed to load image</p>
                </div>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={file.fileName}
            className="w-full h-auto rounded-xl shadow-lg"
        />
    );
}

function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
