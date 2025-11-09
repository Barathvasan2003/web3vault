'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/components/ui/Toast';

interface FileListProps {
    account: any;
    refreshTrigger: number;
    sharedMode?: boolean;
}

export default function FileList({ account, refreshTrigger, sharedMode = false }: FileListProps) {
    const { showToast } = useToast();
    const [files, setFiles] = useState<any[]>([]);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [shareModal, setShareModal] = useState<any>(null);
    const [aiModal, setAiModal] = useState<any>(null);
    const [isEditingAI, setIsEditingAI] = useState(false);
    const [editedAIData, setEditedAIData] = useState<any>(null);
    const [imagePreviewModal, setImagePreviewModal] = useState<any>(null);
    const [shareOption, setShareOption] = useState<'one-time' | '24-hours' | 'custom' | 'permanent'>('one-time');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [customDays, setCustomDays] = useState(0);
    const [generatedShareLink, setGeneratedShareLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [shareWalletAddress, setShareWalletAddress] = useState('');

    useEffect(() => {
        loadFiles();
    }, [account, refreshTrigger, sharedMode]);

    const loadFiles = async () => {
        const fileRegistry = await import('@/lib/storage/file-registry');

        if (sharedMode) {
            // Show skeleton while loading
            setFiles([]);
            // Load files shared with current user from blockchain, share tokens, and localStorage
            if (fileRegistry.getSharedFiles.constructor.name === 'AsyncFunction') {
                const sharedFiles = await fileRegistry.getSharedFiles(account.address);
                setFiles(sharedFiles);
            } else {
                // Fallback for sync version
                const sharedFiles = fileRegistry.getSharedFiles(account.address);
                setFiles(sharedFiles);
            }
        } else {
            // Load user's own files from local registry
            let userFiles = fileRegistry.getFiles(account.address);
            console.log(`📂 Local storage has ${userFiles.length} files`);

            // ALWAYS try to load from blockchain for cross-device sync
            try {
                const blockchainLib = await import('@/lib/polkadot/blockchain');
                const blockchainFiles = await blockchainLib.getFilesFromBlockchain(account.address);
                console.log(`⛓️ Blockchain has ${blockchainFiles.length} files`);

                if (blockchainFiles.length > 0) {
                    // Merge blockchain files with local files (remove duplicates by CID)
                    const allFiles = [...userFiles];
                    blockchainFiles.forEach(bcFile => {
                        if (!allFiles.some(f => f.cid === bcFile.cid)) {
                            allFiles.push(bcFile);
                            // Save blockchain file to local storage for faster future access
                            fileRegistry.registerFile(account.address, bcFile);
                        }
                    });

                    // Update userFiles after sync
                    userFiles = allFiles;
                    console.log(`✅ Total files after blockchain sync: ${allFiles.length}`);
                }
            } catch (blockchainError) {
                console.warn('⚠️ Blockchain sync failed, using local storage only:', blockchainError);
            }

            setFiles(userFiles.reverse());
            console.log(`📊 Displaying ${userFiles.length} files in dashboard`);
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
                showToast(`Access Denied! ${accessCheck.reason}`, 'error', 5000);
                setDownloading(null);
                return;
            }
            const encryptionLib = await import('@/lib/encryption/medical-encryption');
            const ipfsLib = await import('@/lib/ipfs/ipfs-upload-download');

            // Get file from IPFS network
            console.log('📥 Fetching encrypted file from IPFS:', file.cid);
            const encryptedArrayBuffer = await ipfsLib.downloadFromIPFS(
                file.cid,
                (progress) => {
                    console.log(`📥 Downloading... ${progress}%`);
                }
            );

            if (!encryptedArrayBuffer || encryptedArrayBuffer.byteLength === 0) {
                throw new Error('File not found on IPFS network. The file may not have been uploaded to Pinata. Please check your IPFS settings.');
            }

            // Decrypt the file
            const key = await encryptionLib.importKey(file.encryptionKey);
            const iv = new Uint8Array(file.iv);
            const { fileData: decryptedData } = await encryptionLib.decryptMedicalFile(
                encryptedArrayBuffer,
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
            showToast('Download failed: ' + err.message, 'error', 5000);
        } finally {
            setDownloading(null);
        }
    };

    const handleDelete = async (cid: string) => {
        const file = files.find(f => f.cid === cid);
        const fileName = file?.fileName || 'this file';

        if (!confirm(`⚠️ PERMANENTLY DELETE "${fileName}"?\n\nThis will:\n✅ Remove from IPFS storage\n✅ Clear all local cache\n✅ Delete from file registry\n✅ Remove access controls\n\n⚠️ This action CANNOT be undone!\n⚠️ File will NOT reappear after reload!`)) {
            return;
        }

        try {
            console.log('🗑️ Starting permanent deletion for CID:', cid);

            // 1. Remove from file registry (localStorage + memory)
            const fileRegistry = await import('@/lib/storage/file-registry');
            fileRegistry.removeFile(account.address, cid);
            console.log('✅ Removed from file registry');

            // 2. Clear encrypted data cache from localStorage
            try {
                localStorage.removeItem(`encrypted_${cid}`);
                console.log('✅ Cleared encrypted data cache');
            } catch (e) {
                console.warn('Could not clear encrypted cache:', e);
            }

            // 3. Remove access control list
            try {
                const accessControlLib = await import('@/lib/access/access-control');
                accessControlLib.deleteACL(cid);
                console.log('✅ Removed access control list');
            } catch (e) {
                console.warn('Could not remove ACL:', e);
            }

            // 4. Unpin from IPFS/Pinata (if API keys available)
            try {
                const ipfsLib = await import('@/lib/ipfs/ipfs-upload-download');
                const unpinned = await ipfsLib.unpinFile(cid);
                if (unpinned) {
                    console.log('✅ Unpinned from IPFS/Pinata');
                } else {
                    console.warn('⚠️ Could not unpin from IPFS (may require manual cleanup)');
                }
            } catch (e) {
                console.warn('IPFS unpin failed:', e);
            }

            // 5. Update UI immediately
            const updatedFiles = files.filter(f => f.cid !== cid);
            setFiles(updatedFiles);

            console.log('✅ File permanently deleted!');
            showToast('File deleted successfully! Removed from IPFS, cache, and registry.', 'success', 4000);

        } catch (error: any) {
            console.error('❌ Delete failed:', error);
            showToast(`Failed to delete file: ${error.message}`, 'error', 5000);
        }
    };

    const loadImagePreview = async (file: any) => {
        try {
            const encryptionLib = await import('@/lib/encryption/medical-encryption');
            const ipfsLib = await import('@/lib/ipfs/ipfs-upload-download');

            // Try to get file from IPFS (Pinata)
            console.log('📥 Fetching image from IPFS:', file.cid);
            const encryptedArrayBuffer = await ipfsLib.downloadFromIPFS(file.cid);

            if (!encryptedArrayBuffer || encryptedArrayBuffer.byteLength === 0) {
                throw new Error('Image not found on IPFS network. Please re-upload with Pinata API key.');
            }

            const key = await encryptionLib.importKey(file.encryptionKey);
            const iv = new Uint8Array(file.iv);
            const { fileData: decryptedData } = await encryptionLib.decryptMedicalFile(
                encryptedArrayBuffer,
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
        if (!shareModal) {
            showToast('No file selected for sharing.', 'error');
            return;
        }

        try {
            // Use secure token-based sharing (encryption keys NOT in URL)
            const tokenLib = await import('@/lib/sharing/access-tokens');

            // Create access token
            const token = tokenLib.createAccessToken(
                shareModal.cid,
                shareModal.encryptionKey,
                shareModal.iv,
                shareModal.fileName,
                shareModal.fileType,
                shareOption, // 'one-time' | '24-hours' | 'permanent'
                account.address,
                customStartDate,
                customEndDate
            );

            // Store token locally (for owner's reference)
            tokenLib.storeAccessToken(token);

            // Generate shareable URL with token data embedded (works across devices!)
            const shareLink = tokenLib.generateShareableTokenUrl(token);

            // Set the generated share link to display in UI
            setGeneratedShareLink(shareLink);

            // Copy share link to clipboard
            navigator.clipboard.writeText(shareLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 3000);

            // Get token info for display
            const tokenInfo = tokenLib.getTokenInfo(token);

            // Success message
            const shareTypeEmoji = shareOption === 'one-time' ? '🔒' :
                shareOption === '24-hours' ? '⏰' : '♾️';

            const shareTypeText = shareOption === 'one-time' ? 'One-Time Access' :
                shareOption === '24-hours' ? '24-Hour Access' :
                    shareOption === 'custom' ? 'Custom Date Range' : 'Permanent Access';

            showToast(`${shareTypeEmoji} ${shareTypeText} link generated! Link copied to clipboard.`, 'success', 4000);

            console.log('📤 Secure token-based link generated');
            console.log('   Token ID:', token.tokenId);
            console.log('   Type:', shareOption);
            console.log('   Link:', shareLink);
            console.log('   Info:', tokenInfo);

        } catch (error: any) {
            console.error('Error generating share link:', error);
            showToast(`Error generating share link: ${error.message}`, 'error', 5000);
        }
    }; const handleViewAccessList = async () => {
        if (!shareModal) return;

        try {
            const accessControlLib = await import('@/lib/access/access-control');
            const acl = accessControlLib.getACL(shareModal.cid);

            if (!acl) {
                showToast('No access control found for this file.', 'error');
                return;
            }

            const accessInfo = accessControlLib.getAccessInfo(acl);
            showToast(`Access Control List: ${accessInfo}`, 'info', 6000);

        } catch (error: any) {
            console.error('Error viewing access list:', error);
            showToast(`Error: ${error.message}`, 'error', 5000);
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
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="bg-white/80 backdrop-blur-2xl rounded-3xl p-12 border border-gray-200 text-center shadow-2xl flex flex-col items-center justify-center"
            >
                <div className="flex justify-center mb-6">
                    return (
                    <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border-2 border-gray-100 shadow-2xl">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                            <div className="flex items-center space-x-4">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl"
                                >
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                </motion.div>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                                        My Medical Records
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Securely stored and encrypted</p>
                                </div>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-sm font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 px-6 py-3 rounded-xl shadow-lg"
                            >
                                {files.length} {files.length === 1 ? 'file' : 'files'}
                            </motion.div>
                        </div>
                        {/* Horizontal Scroll Container - Enhanced */}
                        <div className="relative">
                            <div
                                className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth custom-scrollbar"
                                style={{
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: '#a78bfa #f1f5f9',
                                    background: 'rgba(255,255,255,0.7)',
                                    borderRadius: '1.5rem',
                                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    border: '2px solid rgba(255,255,255,0.18)'
                                }}
                            >
                                {files.map((file, index) => (
                                    <motion.div
                                        key={file.cid}
                                        initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{
                                            delay: index * 0.1,
                                            duration: 0.4,
                                            ease: [0.4, 0, 0.2, 1]
                                        }}
                                        whileHover={{
                                            y: -8,
                                            scale: 1.02,
                                            transition: { duration: 0.2 }
                                        }}
                                        className="flex-shrink-0 w-80 bg-gradient-to-br from-white via-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 group snap-start"
                                    >
                                        {/* File Icon & Type Badge */}
                                        <div className="flex items-start justify-between mb-5">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl"
                                            >
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </motion.div>
                                            {file.fileType.startsWith('image/') ? (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setImagePreviewModal(file)}
                                                    className="text-xs font-bold px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    VIEW IMAGE
                                                </motion.button>
                                            ) : (
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getRecordTypeBadge(file.recordType)}`}>
                                                    {file.recordType.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {/* ...existing code... */}
                                    </motion.div>
                                ))}
                            </div>
                            {/* Scroll Hint */}
                            {files.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.7, delay: 0.2 }}
                                    className="mt-6 text-center text-base text-purple-500 font-semibold flex items-center justify-center gap-2 bg-white/70 rounded-xl px-4 py-2 shadow-lg"
                                >
                                    <motion.svg
                                        animate={{ x: [0, 8, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.2 }}
                                        className="w-6 h-6 text-blue-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </motion.svg>
                                    <span>Scroll horizontally to see more records</span>
                                </motion.div>
                            )}
                        </div>
                        {/* Share Modal - Modern with Animations */}
                        <AnimatePresence>
                            {shareModal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
                                    onClick={(e) => {
                                        if (e.target === e.currentTarget) {
                                            setShareModal(null);
                                            setShareOption('one-time');
                                            setShareWalletAddress('');
                                            setGeneratedShareLink('');
                                        }
                                    }}
                                >
                                    {/* ...modal content here... */}
                                </motion.div>
                            )}
                        </AnimatePresence>
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        <span>Download</span>
                                                    </>
                                                )}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setShareModal(file);
                                                    setShareOption('one-time'); // Default to most secure option
                                                    setGeneratedShareLink(''); // Clear previous link
                                                    setCustomStartDate('');
                                                    setCustomEndDate('');
                                                    setCustomDays(0);
                                                }}
                                                className="flex items-center justify-center gap-1.5 px-3 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all text-xs font-bold shadow-lg hover:shadow-xl"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                                <span>Share</span>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDelete(file.cid)}
                                                className="flex items-center justify-center gap-1.5 px-3 py-3 bg-gradient-to-r from-red-500 via-rose-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all text-xs font-bold shadow-lg hover:shadow-xl"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <span>Delete</span>
                                            </motion.button>
                                        </div >
                        </motion.div >
                    ))
    }
                    </div >

        {/* Scroll Hint */ }
    {
        files.length > 1 && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-6 text-center text-base text-purple-500 font-semibold flex items-center justify-center gap-2 bg-white/70 rounded-xl px-4 py-2 shadow-lg"
            >
                <motion.svg
                    animate={{ x: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
                <span>Scroll horizontally to see more records</span>
            </motion.div>
        )
    }
                </div >

        {/* Share Modal - Modern with Animations */ }
        <AnimatePresence>
    {
        shareModal && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setShareModal(null);
                        setShareOption('one-time');
                        setShareWalletAddress('');
                        setGeneratedShareLink('');
                    }
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 border-2 border-gray-200 shadow-2xl my-4 max-h-[90vh] overflow-hidden flex flex-col"
                >
                    <div className="flex-1 overflow-y-auto modal-scrollbar pr-2">
                        <div className="flex items-center justify-between mb-6">
                            <motion.h3
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3"
                            >
                                <span className="text-3xl">🔗</span>
                                Share File
                            </motion.h3>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    setShareModal(null);
                                    setShareOption('one-time');
                                    setGeneratedShareLink('');
                                }}
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center text-2xl font-bold"
                            >
                                ×
                            </motion.button>
                        </div>
                        <div className="space-y-4 md:space-y-6">
                            {/* File Information */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 md:p-6 rounded-2xl border border-green-200">
                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                    <span className="text-2xl sm:text-3xl">📁</span>
                                    <div>
                                        <h4 className="text-base sm:text-lg font-bold text-gray-800">{shareModal.fileName}</h4>
                                        <p className="text-xs sm:text-sm text-gray-600">Select share type and generate link</p>
                                    </div>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1 sm:mb-2">IPFS CID:</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={shareModal.cid}
                                                readOnly
                                                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-xs sm:text-sm font-mono text-gray-800"
                                            />
                                        </div>
                                    </div>

                                    {/* Share Type Selection */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1 sm:mb-2">Share Type:</label>
                                        <select
                                            value={shareOption}
                                            onChange={(e) => {
                                                const newOption = e.target.value as 'one-time' | '24-hours' | 'custom' | 'permanent';
                                                setShareOption(newOption);

                                                // Initialize custom dates when selecting custom option
                                                if (newOption === 'custom') {
                                                    const today = new Date().toISOString().split('T')[0];
                                                    setCustomStartDate(today);
                                                    setCustomEndDate('');
                                                    setCustomDays(0);
                                                }
                                            }}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-green-400"
                                        >
                                            <option value="one-time">🔒 One-Time Access (expires after 1 view)</option>
                                            <option value="24-hours">⏰ 24-Hour Access</option>
                                            <option value="custom">📅 Custom Date Range</option>
                                            <option value="permanent">♾️ Permanent Access</option>
                                        </select>
                                    </div>

                                    {/* Custom Date Range Picker */}
                                    {shareOption === 'custom' && (
                                        <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border border-purple-300">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1 sm:mb-2">Start Date:</label>
                                                    <input
                                                        type="date"
                                                        value={customStartDate}
                                                        onChange={(e) => {
                                                            setCustomStartDate(e.target.value);
                                                            // Recalculate days if both dates are set
                                                            if (customEndDate && e.target.value) {
                                                                const start = new Date(e.target.value);
                                                                const end = new Date(customEndDate);
                                                                const diffTime = end.getTime() - start.getTime();
                                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                                setCustomDays(diffDays > 0 ? diffDays : 0);
                                                            }
                                                        }}
                                                        className="w-full px-2 sm:px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1 sm:mb-2">End Date:</label>
                                                    <input
                                                        type="date"
                                                        value={customEndDate}
                                                        onChange={(e) => {
                                                            setCustomEndDate(e.target.value);
                                                            // Calculate days between dates
                                                            if (customStartDate && e.target.value) {
                                                                const start = new Date(customStartDate);
                                                                const end = new Date(e.target.value);
                                                                const diffTime = end.getTime() - start.getTime();
                                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                                setCustomDays(diffDays > 0 ? diffDays : 0);
                                                            }
                                                        }}
                                                        min={customStartDate}
                                                        className="w-full px-2 sm:px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs sm:text-sm text-gray-800 focus:outline-none focus:border-purple-500"
                                                    />
                                                </div>
                                            </div>
                                            {customDays > 0 && (
                                                <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border border-purple-400">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs sm:text-sm font-bold text-gray-700">Access Duration:</span>
                                                        <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                            {customDays} {customDays === 1 ? 'Day' : 'Days'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {new Date(customStartDate).toLocaleDateString()} → {new Date(customEndDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Generated Link Display with QR Code */}
                                    {generatedShareLink ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-400 shadow-xl"
                                        >
                                            <div className="flex items-center gap-2 mb-5">
                                                <motion.span
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                    className="text-2xl"
                                                >
                                                    ✅
                                                </motion.span>
                                                <p className="text-base font-bold text-green-800">Share Link Generated!</p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                {/* QR Code Section */}
                                                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border-2 border-green-200">
                                                    <p className="text-xs font-semibold text-gray-600 mb-3">Scan to Access</p>
                                                    <div className="p-3 bg-white rounded-lg shadow-inner">
                                                        <QRCodeSVG
                                                            value={generatedShareLink}
                                                            size={160}
                                                            level="H"
                                                            includeMargin={true}
                                                            fgColor="#059669"
                                                            bgColor="#ffffff"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-3 text-center max-w-[180px]">
                                                        Scan with your phone camera to open instantly
                                                    </p>
                                                </div>

                                                {/* Link Section */}
                                                <div className="flex flex-col justify-center space-y-3">
                                                    <div className="relative">
                                                        <label className="block text-xs font-semibold text-gray-600 mb-2">Share Link:</label>
                                                        <input
                                                            type="text"
                                                            value={generatedShareLink}
                                                            readOnly
                                                            className="w-full px-4 py-3 bg-white border-2 border-green-300 rounded-xl text-xs font-mono text-gray-800 break-all pr-28 focus:outline-none focus:border-green-500 transition-colors"
                                                        />
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(generatedShareLink);
                                                                setLinkCopied(true);
                                                                setTimeout(() => setLinkCopied(false), 3000);
                                                                showToast('Link copied to clipboard!', 'success', 2000);
                                                            }}
                                                            className={`absolute right-2 top-9 px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${linkCopied
                                                                ? 'bg-green-600 text-white'
                                                                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                                                                }`}
                                                        >
                                                            {linkCopied ? '✓ Copied!' : '📋 Copy'}
                                                        </motion.button>
                                                    </div>

                                                    <div className="pt-2">
                                                        <p className="text-xs text-gray-600 mb-2 font-medium">Share Type:</p>
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-green-200">
                                                            <span className="text-lg">
                                                                {shareOption === 'one-time' ? '🔒' : shareOption === '24-hours' ? '⏰' : shareOption === 'custom' ? '📅' : '♾️'}
                                                            </span>
                                                            <span className="text-xs font-semibold text-gray-700">
                                                                {shareOption === 'one-time' ? 'One-Time Access' :
                                                                    shareOption === '24-hours' ? '24-Hour Access' :
                                                                        shareOption === 'custom' ? 'Custom Date Range' : 'Permanent Access'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3 pt-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => window.open(generatedShareLink, '_blank')}
                                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                    Open Link
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setShareModal(null);
                                                        setShareOption('one-time');
                                                        setShareWalletAddress('');
                                                        setGeneratedShareLink('');
                                                    }}
                                                    className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
                                                >
                                                    ✅ Done
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleGrantAccess}
                                            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-base shadow-xl hover:shadow-2xl transition-all"
                                        >
                                            🔗 Generate Share Link
                                        </motion.button>
                                    )}
                                </div>
                            </div>

                            {/* Security Warning */}
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <span className="text-xl">ℹ️</span>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-bold mb-1">Security Note:</p>
                                        <p>Anyone with the share link can access this file. Keep it secure!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {!generatedShareLink && (
                        <div className="pt-4 border-t border-gray-200 mt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setShareModal(null);
                                    setShareOption('one-time');
                                    setGeneratedShareLink('');
                                }}
                                className="w-full py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                            >
                                Close
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        )
    }
                </AnimatePresence >



        {/* AI Extraction Modal */ }
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

    {/* Image Preview Modal */ }
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
        <div className="flex items-center justify-center py-8">
            <img
                src={imageUrl ?? ''}
                alt={file.fileName}
                className="w-full h-auto rounded-xl shadow-lg"
                style={{ maxWidth: '600px', maxHeight: '80vh' }}
            />
        </div>
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
