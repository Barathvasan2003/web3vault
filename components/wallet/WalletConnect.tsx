'use client';

import React, { useState, useEffect } from 'react';

interface WalletConnectProps {
    onConnect: (account: any) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
    const [loading, setLoading] = useState(false);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [showAccountSelect, setShowAccountSelect] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleConnect = async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            setAccounts([]); // Clear previous accounts
            setShowAccountSelect(false); // Reset account selection

            const polka = await import('@/lib/polkadot/blockchain');
            const walletAccounts = polka?.getWalletAccounts ? await polka.getWalletAccounts() : [];

            if (walletAccounts.length === 1) {
                onConnect(walletAccounts[0]);
            } else {
                setAccounts(walletAccounts);
                setShowAccountSelect(true);
            }
        } catch (err: any) {
            setError(err?.message || String(err));
            // Clear any stale session data on error
            sessionStorage.removeItem('authenticated_wallet');
            sessionStorage.removeItem('auth_timestamp');
        } finally {
            setLoading(false);
        }
    };

    if (showAccountSelect) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-teal-50">
                <div className="max-w-2xl w-full">
                    <div className={`bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="text-center mb-8">
                            <div className="relative inline-block mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl animate-bounce-slow">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-white animate-pulse"></div>
                            </div>

                            <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                                Select Your Account
                            </h2>
                            <p className="text-gray-600 text-lg">Choose a wallet to access your medical vault</p>
                        </div>

                        <div className="space-y-4">
                            {accounts.map((account, index) => (
                                <button
                                    key={index}
                                    onClick={() => onConnect(account)}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                    className="w-full p-6 bg-gradient-to-r from-blue-50/50 to-teal-50/50 rounded-2xl border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 group shadow-sm hover:shadow-xl transform hover:-translate-y-1 animate-slide-up"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-800 text-lg">
                                                    {account.meta?.name || 'Polkadot Account'}
                                                </p>
                                                <p className="text-sm text-gray-500 font-mono mt-1">
                                                    {account.address.slice(0, 10)}...{account.address.slice(-10)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-blue-500 group-hover:translate-x-2 transition-transform duration-300">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowAccountSelect(false)}
                            className="mt-6 w-full py-4 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-semibold hover:border-gray-300"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-40 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className={`text-center mb-20 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
                    <div className="relative inline-block mb-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl blur-2xl opacity-50 animate-pulse-slow"></div>
                            <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500">
                                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center animate-bounce-slow">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-7xl font-black mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                            Web3Vault
                        </span>
                    </h1>
                    <p className="text-3xl text-gray-700 mb-4 font-bold">
                        Decentralized Medical Records Platform
                    </p>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Enterprise-grade blockchain security meets AI-powered healthcare.<br />
                        Your medical data, your control, completely decentralized.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-20">
                    {[
                        {
                            icon: (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            ),
                            title: 'End-to-End Encryption',
                            description: 'Military-grade AES-256-GCM encryption protects your data',
                            gradient: 'from-green-400 to-emerald-600',
                            bg: 'from-green-50 to-emerald-50'
                        },
                        {
                            icon: (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ),
                            title: 'Decentralized Storage',
                            description: 'IPFS network ensures data availability worldwide',
                            gradient: 'from-blue-400 to-cyan-600',
                            bg: 'from-blue-50 to-cyan-50'
                        },
                        {
                            icon: (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            ),
                            title: 'Blockchain Secured',
                            description: 'Polkadot network validates ownership immutably',
                            gradient: 'from-purple-400 to-pink-600',
                            bg: 'from-purple-50 to-pink-50'
                        },
                        {
                            icon: (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            ),
                            title: 'AI-Powered Analysis',
                            description: 'Gemini AI extracts prescription data automatically',
                            gradient: 'from-pink-400 to-rose-600',
                            bg: 'from-pink-50 to-rose-50'
                        },
                        {
                            icon: (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            ),
                            title: 'Smart Sharing',
                            description: 'Time-based access control for healthcare providers',
                            gradient: 'from-amber-400 to-orange-600',
                            bg: 'from-amber-50 to-orange-50'
                        },
                        {
                            icon: (
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            ),
                            title: 'Emergency Access',
                            description: 'Critical health info available when it matters most',
                            gradient: 'from-red-400 to-rose-600',
                            bg: 'from-red-50 to-rose-50'
                        }
                    ].map((feature, index) => (
                        <div
                            key={index}
                            style={{ animationDelay: `${index * 150}ms` }}
                            className={`bg-gradient-to-br ${feature.bg} backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-slide-up cursor-pointer group`}
                        >
                            <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 text-white`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>

                {/* Connect CTA */}
                <div className={`max-w-2xl mx-auto transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>

                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:rotate-12 transition-all duration-500">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>

                            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                                Get Started
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                                Connect your Polkadot wallet to access your<br />secure medical vault
                            </p>

                            {error && (
                                <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl animate-shake relative">
                                    <button
                                        onClick={() => setError(null)}
                                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div className="flex-1 text-left">
                                            <p className="text-red-700 font-semibold mb-2">{error}</p>
                                            {error.includes('No Polkadot wallet') && (
                                                <a
                                                    href="https://polkadot.js.org/extension/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors mb-3"
                                                >
                                                    Install Polkadot.js Extension
                                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            )}
                                            {error.includes('No accounts found') && (
                                                <div className="mt-3 space-y-2 text-sm text-red-600">
                                                    <p>💡 <strong>Quick Fix:</strong></p>
                                                    <ol className="list-decimal list-inside space-y-1 ml-4">
                                                        <li>Open Polkadot.js extension</li>
                                                        <li>Create or import an account</li>
                                                        <li>Come back and click "Try Again"</li>
                                                    </ol>
                                                </div>
                                            )}
                                            <button
                                                onClick={handleConnect}
                                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
                                            >
                                                🔄 Try Again
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleConnect}
                                disabled={loading}
                                className="w-full py-6 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                                <span className="relative flex items-center justify-center">
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Connecting to Wallet...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            Connect Polkadot Wallet
                                            <svg className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>

                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <p className="text-gray-600 mb-4 font-semibold">Don't have a Polkadot wallet?</p>
                                <a
                                    href="https://polkadot.js.org/extension/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-50 to-teal-50 text-blue-600 font-bold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all border-2 border-blue-100 hover:border-blue-300"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Install Polkadot Extension
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className={`mt-16 max-w-5xl mx-auto transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-xl rounded-3xl p-10 border border-blue-100 shadow-xl">
                        <div className="flex items-start space-x-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-blue-900 mb-6 text-2xl">How Web3Vault Works</h3>
                                <ol className="space-y-4">
                                    {[
                                        'Upload medical files - encrypted client-side with AES-256-GCM',
                                        'AI analyzes prescriptions and extracts medicine details automatically',
                                        'Encrypted file stored on IPFS decentralized network',
                                        'File hash and metadata recorded on Polkadot blockchain',
                                        'Only you can decrypt using your wallet\'s private keys'
                                    ].map((step, index) => (
                                        <li key={index} className="flex items-start space-x-3 group">
                                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform shadow-md">
                                                {index + 1}
                                            </div>
                                            <span className="text-gray-700 font-medium pt-1">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Badge */}
                <div className={`mt-12 text-center transition-all duration-1000 delay-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="inline-flex items-center space-x-6 bg-white/60 backdrop-blur-xl rounded-full px-8 py-4 shadow-lg border border-white/50">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-gray-700">HIPAA Compliant</span>
                        </div>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-gray-700">256-bit Encryption</span>
                        </div>
                        <div className="w-px h-6 bg-gray-300"></div>
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-semibold text-gray-700">Zero-Knowledge</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
