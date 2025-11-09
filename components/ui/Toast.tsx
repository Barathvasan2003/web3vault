'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 4000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, message, type, duration };
        
        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                            className="pointer-events-auto"
                        >
                            <div
                                className={`
                                    px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border-2
                                    min-w-[300px] max-w-md
                                    ${
                                        toast.type === 'success'
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-green-400'
                                            : toast.type === 'error'
                                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400'
                                            : toast.type === 'warning'
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400'
                                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}
                                        </span>
                                        <p className="font-semibold text-sm leading-relaxed">{toast.message}</p>
                                    </div>
                                    <button
                                        onClick={() => removeToast(toast.id)}
                                        className="text-white/80 hover:text-white transition-colors text-xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

