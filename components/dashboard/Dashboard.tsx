'use client';

import React, { useState, useEffect } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import EmergencyCard from './EmergencyCard';

interface DashboardProps {
    account: any;
    blockchainConnected: boolean;
}

export default function Dashboard({ account, blockchainConnected }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'upload' | 'files' | 'emergency' | 'shared'>('upload');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [showKeyManager, setShowKeyManager] = useState(false);
    const [showCloudBackup, setShowCloudBackup] = useState(false);
    const [backupPassword, setBackupPassword] = useState('');
    const [restorePassword, setRestorePassword] = useState('');
    const [uploading, setUploading] = useState(false);
    const [cloudBackupCID, setCloudBackupCID] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // Check if cloud backup exists
        const cid = localStorage.getItem(`backup_cid_${account.address}`);
        setCloudBackupCID(cid);
    }, [account.address]);

    const handleExportKeys = () => {
        const keys = localStorage.getItem(`files_${account.address}`);
        if (!keys) {
            alert('No encryption keys found to export!');
            return;
        }

        const blob = new Blob([keys], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `web3vault-keys-${account.address.slice(0, 8)}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('✅ Encryption keys exported successfully!\n\nStore this file securely. You\'ll need it to access your files on other devices.');
    };

    const handleImportKeys = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                JSON.parse(content); // Validate JSON

                const confirmed = confirm('⚠️ Importing keys will overwrite your current keys!\n\nAre you sure you want to continue?');
                if (confirmed) {
                    localStorage.setItem(`files_${account.address}`, content);
                    alert('✅ Encryption keys imported successfully!\n\nYour files should now be accessible.');
                    setRefreshTrigger(prev => prev + 1);
                }
            } catch (error) {
                alert('❌ Invalid key file! Please select a valid Web3Vault key backup file.');
            }
        };
        reader.readAsText(file);
    };

    const handleCloudBackup = async () => {
        if (!backupPassword || backupPassword.length < 8) {
            alert('⚠️ Password must be at least 8 characters long!');
            return;
        }

        try {
            setUploading(true);

            // Dynamic import to avoid bundling issues
            const [keyBackupLib, ipfsLib] = await Promise.all([
                import('@/lib/encryption/key-backup'),
                import('@/lib/ipfs/ipfs-client-mock'),
            ]);

            // Create encrypted backup
            const { backupData, ipfsMetadata } = await keyBackupLib.createBackupPackage(
                account.address,
                backupPassword
            );

            // Upload to IPFS
            const encoder = new TextEncoder();
            const backupBuffer = encoder.encode(backupData);
            const { cid } = await ipfsLib.uploadToIPFS(
                backupBuffer.buffer,
                {
                    fileName: ipfsMetadata.name,
                    fileType: 'application/json',
                    recordType: 'key-backup',
                    iv: new Uint8Array(12),
                    patientId: account.address,
                },
                (progress: number) => console.log('Upload progress:', progress)
            );

            // Save CID for future restoration
            keyBackupLib.saveCloudBackupCID(account.address, cid);
            setCloudBackupCID(cid);

            alert(`✅ Keys backed up to IPFS successfully!\n\nBackup CID: ${cid}\n\nYou can now login from any browser and restore your keys using this CID and your password.`);
            setBackupPassword('');
            setShowCloudBackup(false);
        } catch (error: any) {
            alert('❌ Cloud backup failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleCloudRestore = async () => {
        if (!restorePassword) {
            alert('⚠️ Please enter your backup password!');
            return;
        }

        const cid = prompt('Enter your backup CID:');
        if (!cid) return;

        try {
            setUploading(true);

            // Dynamic import
            const [keyBackupLib, ipfsLib] = await Promise.all([
                import('@/lib/encryption/key-backup'),
                import('@/lib/ipfs/ipfs-client-mock'),
            ]);

            // Download from IPFS
            const backupData = await ipfsLib.getFromIPFS(cid);
            const decoder = new TextDecoder();
            const backupString = decoder.decode(backupData);

            // Restore keys
            await keyBackupLib.restoreFromBackup(
                backupString,
                restorePassword,
                account.address
            );

            // Save CID for future reference
            keyBackupLib.saveCloudBackupCID(account.address, cid);
            setCloudBackupCID(cid);

            alert('✅ Keys restored from cloud successfully!\n\nYour files should now be accessible.');
            setRestorePassword('');
            setRefreshTrigger(prev => prev + 1);
            setShowCloudBackup(false);
        } catch (error: any) {
            alert('❌ Cloud restore failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleUploadSuccess = () => {
        setRefreshTrigger(prev => prev + 1);
        setActiveTab('files');
    };

    const tabs = [
        {
            id: 'upload',
            label: 'Upload',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            )
        },
        {
            id: 'files',
            label: 'My Records',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            )
        },
        {
            id: 'emergency',
            label: 'Emergency',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        {
            id: 'shared',
            label: 'Shared With Me',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                <div className="absolute top-10 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className={`relative max-w-7xl mx-auto px-4 py-8 transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                {/* Welcome Header */}
                <div className="mb-8 bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold mb-1">
                                    Welcome back, <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">{account.meta?.name || 'User'}</span>!
                                </h2>
                                <p className="text-gray-600 text-lg">
                                    Your secure medical vault is ready to use
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <div className="flex items-center space-x-3 mb-3 bg-white px-4 py-2 rounded-xl shadow-md">
                                <div className={`w-3 h-3 rounded-full ${blockchainConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`}></div>
                                <span className="text-sm font-bold text-gray-700">
                                    {blockchainConnected ? 'Blockchain Connected' : 'Local Mode'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500 font-mono bg-gradient-to-r from-blue-50 to-teal-50 px-4 py-2 rounded-xl border border-blue-100">
                                {account.address.slice(0, 10)}...{account.address.slice(-10)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Simple Info Card - Blockchain Backup */}
                <div className="mb-8 bg-gradient-to-br from-cyan-50 to-blue-50 backdrop-blur-xl rounded-3xl p-6 border-2 border-cyan-200 shadow-xl animate-slide-up">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-cyan-900 mb-1">⛓️ Blockchain Backup Active</h3>
                            <p className="text-sm text-cyan-700">
                                Your files are backed up on Polkadot blockchain. Access from any device with your wallet!
                            </p>
                        </div>
                    </div>

                </div>

                {/* Stats Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 backdrop-blur-sm rounded-3xl p-6 border border-green-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up cursor-pointer group" style={{ animationDelay: '0ms' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-bold mb-2">Security Level</p>
                                <p className="text-5xl font-black text-green-700">100%</p>
                            </div>
                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-green-700 mt-4 font-semibold">AES-256-GCM Encrypted</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm rounded-3xl p-6 border border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up cursor-pointer group" style={{ animationDelay: '150ms' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-bold mb-2">Storage</p>
                                <p className="text-5xl font-black text-blue-700">IPFS</p>
                            </div>
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-blue-700 mt-4 font-semibold">Decentralized Network</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm rounded-3xl p-6 border border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up cursor-pointer group" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-bold mb-2">Blockchain</p>
                                <p className="text-5xl font-black text-purple-700">Polkadot</p>
                            </div>
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-purple-700 mt-4 font-semibold">Ownership Verified</p>
                    </div>
                </div>

                {/* Professional Tabs */}
                <div className="mb-8">
                    <div className="flex space-x-2 bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 px-6 py-4 font-bold text-lg transition-all duration-300 rounded-xl flex items-center justify-center space-x-2 ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white shadow-lg scale-105'
                                    : 'text-gray-600 hover:bg-gray-50 hover:scale-102'
                                    }`}
                            >
                                <span className={activeTab === tab.id ? 'animate-bounce-slow' : ''}>{tab.icon}</span>
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="animate-slide-up">
                    {activeTab === 'upload' && (
                        <FileUpload
                            account={account}
                            blockchainConnected={blockchainConnected}
                            onUploadSuccess={handleUploadSuccess}
                        />
                    )}
                    {activeTab === 'files' && (
                        <FileList
                            account={account}
                            refreshTrigger={refreshTrigger}
                        />
                    )}
                    {activeTab === 'emergency' && (
                        <EmergencyCard account={account} />
                    )}
                    {activeTab === 'shared' && (
                        <FileList
                            account={account}
                            refreshTrigger={refreshTrigger}
                            sharedMode={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
