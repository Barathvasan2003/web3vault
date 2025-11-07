'use client';

import React, { useState, useRef } from 'react';

interface FileUploadProps {
    account: any;
    blockchainConnected: boolean;
    onUploadSuccess: () => void;
}

export default function FileUpload({ account, blockchainConnected, onUploadSuccess }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [aiData, setAiData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setAiData(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            setSelectedFile(file);
            setError(null);
            setAiData(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            setUploading(true);
            setError(null);
            setProgress(0);

            // Dynamically import all service modules to avoid bundling them at build time
            const [encryptionLib, ipfsLib, geminiLib] = await Promise.all([
                import('@/lib/encryption/medical-encryption'),
                import('@/lib/ipfs/ipfs-client'), // Use real IPFS client
                import('@/lib/ai/gemini-ocr'),
            ]);

            // Step 1: AI Processing with Gemini Vision (if image)
            let extractedData: any = null;
            if (selectedFile.type.startsWith('image/')) {
                setStatus('🤖 Analyzing prescription with Gemini AI...');
                setProgress(10);

                try {
                    const geminiResult = await geminiLib.extractMedicalDataFromImage(
                        selectedFile,
                        (ocrProgress) => {
                            setProgress(10 + (ocrProgress * 0.3)); // 10-40%
                        }
                    );

                    extractedData = geminiResult.structuredData;
                    setAiData(extractedData);
                    setProgress(45);

                    console.log('✅ Gemini extraction complete:', extractedData);
                } catch (aiError) {
                    console.log('AI processing skipped:', aiError);
                    setProgress(45);
                }
            }

            // Step 2: Encrypt
            setStatus('🔒 Encrypting file...');
            setProgress(50);

            const { encryptedData, key, iv, metadata } = await encryptionLib.encryptMedicalFile(
                selectedFile,
                {
                    recordType: aiData?.category || 'other',
                    patientId: account.address,
                    uploadDate: new Date().toISOString(),
                }
            );

            // Step 3: Upload to IPFS
            setStatus('🌐 Uploading encrypted file to IPFS...');
            setProgress(70);

            const { cid } = await ipfsLib.uploadToIPFS(
                encryptedData,
                {
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    recordType: aiData?.category || 'other',
                    iv,
                    patientId: account.address,
                },
                (uploadProgress: number) => {
                    setProgress(70 + (uploadProgress * 0.3)); // 70-100%
                    setStatus(`🌐 Uploading to IPFS... ${Math.round(uploadProgress)}%`);
                }
            );

            setProgress(100);
            setStatus(`✅ Uploaded to IPFS! CID: ${cid}`);

            // File is now permanently stored on decentralized IPFS network
            console.log('📦 File stored on decentralized IPFS (no local storage needed)');
            console.log(`🌐 Accessible at: https://ipfs.io/ipfs/${cid}`);

            // Store file metadata in decentralized registry
            const keyBase64 = await encryptionLib.exportKey(key);
            const fileMetadata = {
                cid,
                fileName: selectedFile.name,
                fileType: selectedFile.type,
                fileSize: selectedFile.size,
                encryptionKey: keyBase64,
                iv: Array.from(iv),
                uploadedAt: new Date().toISOString(),
                recordType: extractedData?.category || 'other',
                aiData: extractedData || null,
                owner: account.address,
            };

            // Register file metadata
            const fileRegistry = await import('@/lib/storage/file-registry');
            fileRegistry.registerFile(account.address, fileMetadata);

            console.log('✅ File uploaded - fully decentralized (IPFS + Registry)');            // Reset
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            setTimeout(() => {
                onUploadSuccess();
            }, 1500);

        } catch (err: any) {
            setError(err.message);
            setProgress(0);
        } finally {
            setUploading(false);
        }
    }; return (
        <div className="glass rounded-2xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold mb-6 gradient-text">📤 Upload Medical Record</h2>

            {/* Drag & Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-all mb-6 bg-gray-800/30"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,.pdf"
                />

                <div className="text-7xl mb-4">
                    {selectedFile ? (selectedFile.type.startsWith('image/') ? '🖼️' : '📄') : '📁'}
                </div>

                {selectedFile ? (
                    <div>
                        <p className="text-2xl font-semibold text-primary mb-2">
                            {selectedFile.name}
                        </p>
                        <p className="text-gray-400">
                            {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown'}
                        </p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFile(null);
                                setAiData(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                        >
                            Remove file
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="text-xl mb-2 text-white">
                            Drag and drop your file here
                        </p>
                        <p className="text-gray-400">
                            or click to browse (Images, PDFs supported)
                        </p>
                    </div>
                )}
            </div>

            {/* AI Extraction Results */}
            {aiData && (
                <div className="mb-6 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <span className="mr-2">🤖</span>
                        Gemini AI Extracted Information
                    </h3>

                    {/* Doctor & Patient Info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {aiData.doctorName && (
                            <div className="bg-black/30 p-3 rounded-lg">
                                <p className="text-gray-400 text-xs mb-1">👨‍⚕️ Doctor</p>
                                <p className="text-white font-semibold">{aiData.doctorName}</p>
                                {aiData.doctorSpecialization && (
                                    <p className="text-gray-300 text-sm">{aiData.doctorSpecialization}</p>
                                )}
                            </div>
                        )}
                        {aiData.patientName && (
                            <div className="bg-black/30 p-3 rounded-lg">
                                <p className="text-gray-400 text-xs mb-1">👤 Patient</p>
                                <p className="text-white font-semibold">{aiData.patientName}</p>
                                {(aiData.patientAge || aiData.patientGender) && (
                                    <p className="text-gray-300 text-sm">
                                        {aiData.patientAge} {aiData.patientGender && `• ${aiData.patientGender}`}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Diagnosis */}
                    {aiData.diagnosis && (
                        <div className="mb-4 bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                            <p className="text-gray-400 text-xs mb-1">🩺 Diagnosis</p>
                            <p className="text-white">{aiData.diagnosis}</p>
                        </div>
                    )}

                    {/* Medications - Detailed */}
                    {aiData.medications?.length > 0 && (
                        <div className="mb-4">
                            <p className="text-gray-400 text-sm mb-3 font-semibold">💊 Medications ({aiData.medications.length})</p>
                            <div className="space-y-3">
                                {aiData.medications.map((med: any, i: number) => (
                                    <div key={i} className="bg-black/30 p-4 rounded-lg border border-green-500/20">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-base">{med.name}</p>
                                                {med.genericName && (
                                                    <p className="text-gray-400 text-xs">Generic: {med.genericName}</p>
                                                )}
                                            </div>
                                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                                                {med.dosage}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <p className="text-gray-400">Frequency:</p>
                                                <p className="text-white">{med.frequency}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400">Timing:</p>
                                                <p className="text-white">{med.timing}</p>
                                            </div>
                                            {med.duration && (
                                                <div>
                                                    <p className="text-gray-400">Duration:</p>
                                                    <p className="text-white">{med.duration}</p>
                                                </div>
                                            )}
                                            {med.instructions && (
                                                <div className="col-span-2">
                                                    <p className="text-gray-400">Instructions:</p>
                                                    <p className="text-yellow-400">{med.instructions}</p>
                                                </div>
                                            )}
                                        </div>

                                        {med.medicineInfo && (
                                            <div className="mt-2 pt-2 border-t border-gray-700">
                                                <p className="text-blue-400 text-xs">ℹ️ {med.medicineInfo}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date & Next Visit */}
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                        {aiData.date && (
                            <div>
                                <p className="text-gray-400">📅 Date:</p>
                                <p className="text-white">{aiData.date}</p>
                            </div>
                        )}
                        {aiData.nextVisit && (
                            <div>
                                <p className="text-gray-400">🔄 Next Visit:</p>
                                <p className="text-white">{aiData.nextVisit}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
                {uploading ? (
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                        {status}
                    </div>
                ) : (
                    <>🚀 Encrypt & Upload</>
                )}
            </button>

            {/* Progress Bar */}
            {uploading && (
                <div className="mb-4">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2 text-center">{progress}%</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start space-x-3">
                    <span className="text-2xl">ℹ️</span>
                    <div className="text-sm text-gray-300">
                        <p className="font-semibold text-blue-400 mb-2">Security Features:</p>
                        <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>AES-256-GCM encryption in your browser</li>
                            <li>AI extracts medical info automatically</li>
                            <li>Only encrypted data uploaded to IPFS</li>
                            <li>Only you can decrypt with your keys</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
