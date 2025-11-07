'use client';

import React, { useState, useEffect } from 'react';
import WalletConnect from '@/components/wallet/WalletConnect';
import Dashboard from '@/components/dashboard/Dashboard';

export default function Home() {
    const [account, setAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [blockchainStatus, setBlockchainStatus] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        try {
            setLoading(true);

            // Dynamically import Polkadot helpers only in the browser at runtime.
            // This avoids bundling Node-only polkadot libs into the client bundle which
            // can cause runtime failures and a blank page.
            const polka = await import('@/lib/polkadot/blockchain');

            // Set a 2-second timeout for blockchain connection
            const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(false), 2000));

            let connected = false;
            if (polka?.initPolkadotAPI) {
                try {
                    await Promise.race([polka.initPolkadotAPI(), timeoutPromise]);
                    connected = polka?.isBlockchainConnected ? await polka.isBlockchainConnected() : false;
                } catch (err) {
                    console.log('Blockchain connection skipped (timeout or error)');
                }
            }
            setBlockchainStatus(!!connected);

        } catch (error) {
            console.error('Initialization error:', error);
            setBlockchainStatus(false);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (connectedAccount: any) => {
        try {
            // Verify wallet signature for authentication
            const polka = await import('@/lib/polkadot/blockchain');
            const verified = await polka.verifyWalletOwnership(connectedAccount);

            if (verified) {
                setAccount(connectedAccount);
                setIsAuthenticated(true);
            } else {
                alert('❌ Wallet verification failed! Please try again.');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            alert('❌ Authentication failed! Please ensure you have Polkadot wallet installed.');
        }
    };

    const handleDisconnect = () => {
        setAccount(null);
        setIsAuthenticated(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-blob"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative text-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full blur-xl opacity-50 animate-pulse-slow"></div>
                        <div className="relative inline-block animate-spin-slow">
                            <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">
                        Initializing Web3Vault
                    </h2>
                    <p className="text-gray-600">Preparing your secure medical vault...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
            {/* Professional Healthcare Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Professional Logo */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                                    Web3Vault
                                </h1>
                                <p className="text-xs text-gray-500 font-medium">Professional Medical Records Platform</p>
                            </div>
                        </div>

                        {/* User Info / Connect */}
                        {account ? (
                            <div className="flex items-center space-x-4">
                                <div className="text-right hidden md:block bg-gradient-to-r from-blue-50 to-teal-50 px-5 py-2.5 rounded-xl border border-blue-100">
                                    <p className="text-sm font-semibold text-gray-800">{account.meta?.name || 'Account'}</p>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {account.address.slice(0, 6)}...{account.address.slice(-4)}
                                    </p>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    className="px-5 py-2.5 border-2 border-red-400 text-red-600 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 font-semibold shadow-sm hover:shadow-md flex items-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Disconnect</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Status:</span>
                                    <div className={`w-2.5 h-2.5 rounded-full ${blockchainStatus ? 'bg-green-500 animate-pulse' : 'bg-amber-400'}`}></div>
                                    <span className="text-sm font-semibold text-gray-800">{blockchainStatus ? 'Blockchain Live' : 'Local Mode'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className={account ? '' : 'container mx-auto px-6 py-8'}>
                {!account ? (
                    <WalletConnect onConnect={handleConnect} />
                ) : (
                    <Dashboard account={account} blockchainConnected={blockchainStatus} />
                )}
            </main>

            {/* Professional Footer */}
            <footer className="border-t border-gray-200 mt-16 py-12 bg-white/80 backdrop-blur-xl">
                <div className="container mx-auto px-6">
                    <div className="text-center">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                                Web3Vault
                            </h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                Enterprise-grade decentralized medical records platform powered by blockchain technology and AI
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">End-to-End Encrypted</h4>
                                <p className="text-sm text-gray-600">Military-grade AES-256-GCM encryption</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Decentralized Storage</h4>
                                <p className="text-sm text-gray-600">IPFS distributed file system</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">AI-Powered Analysis</h4>
                                <p className="text-sm text-gray-600">Gemini Vision for OCR extraction</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500">
                            <p className="mb-2 font-semibold">© 2025 Web3Vault. All rights reserved.</p>
                            <div className="flex items-center justify-center space-x-2 text-xs">
                                <span>Built with</span>
                                <span className="font-semibold text-purple-600">Polkadot</span>
                                <span>•</span>
                                <span className="font-semibold text-blue-600">IPFS</span>
                                <span>•</span>
                                <span className="font-semibold text-pink-600">Google Gemini AI</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
