/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    // Enable image optimization
    images: {
        domains: ['ipfs.io', 'gateway.pinata.cloud', 'cloudflare-ipfs.com'],
        unoptimized: true,
    },

    // Webpack configuration for Web3 libraries
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
            };

            // Fix for multiaddr "Cannot assign to read only property 'name'" error
            config.module = {
                ...config.module,
                exprContextCritical: false,
            };
        }

        // Disable warnings for critical dependencies
        config.ignoreWarnings = [
            { module: /node_modules\/@multiformats/ },
            { module: /node_modules\/ipfs/ },
        ];

        return config;
    },

    // Environment variables available to client
    env: {
        NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'WebVault3',
    },

    // Headers for security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
