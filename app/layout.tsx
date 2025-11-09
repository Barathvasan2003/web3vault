import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'

const inter = Inter({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-inter',
})

export const metadata: Metadata = {
    title: 'WebVault3 - Professional Medical Records Platform',
    description: 'Enterprise-grade decentralized medical vault with AI-powered prescription analysis. HIPAA-compliant blockchain storage.',
    keywords: 'medical records, blockchain, polkadot, IPFS, healthcare, AI, OCR, prescription analysis',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="light">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className={`${inter.variable} font-sans antialiased`}>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    )
}
